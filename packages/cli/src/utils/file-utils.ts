import { promises as fs } from 'fs'
import path from 'path'

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

/**
 * Read JSON file
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content) as T
}

/**
 * Write JSON file
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown
): Promise<void> {
  const content = JSON.stringify(data, null, 2)
  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * Find files matching a pattern in a directory
 */
export async function findFiles(
  dir: string,
  pattern: RegExp
): Promise<string[]> {
  const files: string[] = []

  async function scan(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules' &&
          entry.name !== 'dist' &&
          entry.name !== 'build'
        ) {
          await scan(fullPath)
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath)
      }
    }
  }

  await scan(dir)
  return files
}

/**
 * Read package.json
 */
export async function readPackageJson(
  root: string
): Promise<Record<string, unknown>> {
  const packageJsonPath = path.join(root, 'package.json')
  if (!(await fileExists(packageJsonPath))) {
    throw new Error('package.json not found')
  }
  return readJsonFile(packageJsonPath)
}
