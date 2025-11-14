import path from 'path'
import type { ScaffoldOptions } from '../../types/cli.js'
import type { StrictureConfig } from '@stricture/core'
import { fileExists, readJsonFile, ensureDir } from '../../utils/file-utils.js'
import { logger } from '../../utils/logger.js'
import { promptConfirm } from '../../utils/prompts.js'
import { promises as fs } from 'fs'

/**
 * Scaffold directory structure based on configuration
 */
export async function scaffold(
  options: ScaffoldOptions = {}
): Promise<void> {
  const projectRoot = process.cwd()
  const configPath =
    options.configPath ?? path.join(projectRoot, '.stricture/config.json')

  logger.log('')
  logger.heading('Scaffolding directory structure...')
  logger.log('')

  // Load config
  if (!(await fileExists(configPath))) {
    logger.error('Configuration file not found')
    logger.dim(`Run 'stricture init' to create configuration`)
    return
  }

  const config = await readJsonFile<StrictureConfig>(configPath)

  // Get directories to create from boundaries
  const directories = config.boundaries
    .map((b: { pattern: string }) => {
      // Extract directory from pattern (e.g., 'src/domain/**' -> 'src/domain')
      const match = b.pattern.match(/^([^*]+)/)
      return match?.[1]?.replace(/\/$/, '') ?? null
    })
    .filter((dir: string | null | undefined): dir is string => dir !== null && dir !== undefined)

  // Show preview
  logger.info('Directories to create:')
  for (const dir of directories) {
    logger.dim(`  - ${dir}`)
  }
  logger.log('')

  // Confirm
  if (!options.force) {
    const confirmed = await promptConfirm('Create these directories?', true)
    if (!confirmed) {
      logger.warn('Scaffolding cancelled')
      return
    }
  }

  // Create directories
  let created = 0
  for (const dir of directories) {
    const fullPath = path.join(projectRoot, dir)

    if (await fileExists(fullPath)) {
      logger.dim(`Skipped ${dir} (already exists)`)
      continue
    }

    await ensureDir(fullPath)
    logger.success(`Created ${dir}`)
    created++

    // Add README if examples enabled
    if (options.examples) {
      const boundary = config.boundaries.find((b: { pattern: string; name: string }) =>
        b.pattern.startsWith(dir + '/')
      )
      if (boundary) {
        await createReadme(fullPath, boundary.name, boundary.pattern)
      }
    }
  }

  logger.log('')
  logger.success(`Created ${created} director${created === 1 ? 'y' : 'ies'}`)
  logger.log('')
}

/**
 * Create a README file for a boundary
 */
async function createReadme(
  dirPath: string,
  boundaryName: string,
  pattern: string
): Promise<void> {
  const readmePath = path.join(dirPath, 'README.md')

  const content = `# ${boundaryName}

This directory represents the **${boundaryName}** boundary.

**Pattern**: \`${pattern}\`

## Purpose

Add a description of this boundary's purpose and responsibilities.

## Dependencies

Document which other boundaries this layer can depend on.

## Examples

Add example files and usage patterns here.
`

  await fs.writeFile(readmePath, content, 'utf-8')
}
