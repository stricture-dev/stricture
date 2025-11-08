import path from 'path'
import type { ProjectInfo, DirectoryStructure } from '../../types/cli.js'
import {
  readPackageJson,
  fileExists,
  directoryExists
} from '../../utils/file-utils.js'

/**
 * Detect project information
 */
export async function detectProject(
  root: string = process.cwd()
): Promise<ProjectInfo> {
  const info: ProjectInfo = {
    root,
    hasTypeScript: false,
    packageManager: 'npm',
    srcDirectory: 'src',
    structure: { directories: [], suggestedBoundaries: [] }
  }

  // Check for package.json
  const packageJson = await readPackageJson(root)
  const dependencies = {
    ...(packageJson['dependencies'] as Record<string, string> | undefined),
    ...(packageJson['devDependencies'] as Record<string, string> | undefined)
  }

  // Detect framework
  if (dependencies['next']) {
    info.framework = 'nextjs'
  } else if (dependencies['@nestjs/core']) {
    info.framework = 'nestjs'
  } else if (dependencies['react']) {
    info.framework = 'react'
  } else if (dependencies['vue']) {
    info.framework = 'vue'
  } else if (dependencies['express']) {
    info.framework = 'express'
  } else {
    info.framework = 'unknown'
  }

  // Detect TypeScript
  info.hasTypeScript = await fileExists(path.join(root, 'tsconfig.json'))

  // Detect package manager
  if (await fileExists(path.join(root, 'pnpm-lock.yaml'))) {
    info.packageManager = 'pnpm'
  } else if (await fileExists(path.join(root, 'yarn.lock'))) {
    info.packageManager = 'yarn'
  } else {
    info.packageManager = 'npm'
  }

  // Detect source directory
  for (const dir of ['src', 'app', 'lib']) {
    if (await directoryExists(path.join(root, dir))) {
      info.srcDirectory = dir
      break
    }
  }

  // Analyze directory structure
  info.structure = await analyzeStructure(root, info.srcDirectory)

  return info
}

/**
 * Analyze directory structure and suggest boundaries
 */
async function analyzeStructure(
  root: string,
  srcDir: string
): Promise<DirectoryStructure> {
  const structure: DirectoryStructure = {
    directories: [],
    suggestedBoundaries: []
  }

  const srcPath = path.join(root, srcDir)
  if (!(await directoryExists(srcPath))) {
    return structure
  }

  // Read top-level directories in src
  const { readdir } = await import('fs/promises')
  const entries = await readdir(srcPath, { withFileTypes: true })

  structure.directories = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => path.join(srcDir, e.name))

  return structure
}
