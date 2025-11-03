import fs from 'fs'
import path from 'path'
import { loadConfig, createMatchPath } from 'tsconfig-paths'

/**
 * Load TypeScript path aliases from tsconfig.json
 *
 * This utility:
 * 1. Looks for tsconfig.json in the provided directory
 * 2. Extracts the paths mapping from compilerOptions
 * 3. Returns a Record<string, string[]> that can be used for path resolution
 * 4. Returns null if no tsconfig or no paths are found
 *
 * Note: Uses tsconfig-paths library for proper resolution including extends
 */
export function loadTsconfigPaths(
  baseDir: string
): Record<string, string[]> | null {
  const tsconfigPath = path.join(baseDir, 'tsconfig.json')

  // Check if tsconfig.json exists
  if (!fs.existsSync(tsconfigPath)) {
    return null
  }

  try {
    // Use tsconfig-paths library to load and resolve config
    const result = loadConfig(baseDir)

    if (result.resultType === 'failed') {
      // Failed to load or parse tsconfig
      return null
    }

    // Extract paths from the loaded config
    const { paths } = result

    // If no paths defined, return null
    if (!paths || Object.keys(paths).length === 0) {
      return null
    }

    return paths
  } catch (err) {
    // If anything goes wrong, gracefully return null
    // ESLint plugin should work without tsconfig paths
    return null
  }
}

/**
 * Create a path matcher for resolving imports
 * This wraps tsconfig-paths createMatchPath for easier use
 */
export function createPathMatcher(
  baseDir: string,
  paths: Record<string, string[]>
): ((importSpecifier: string) => string | undefined) | null {
  try {
    // Get the base URL (usually the directory containing tsconfig.json)
    const absoluteBaseUrl = path.resolve(baseDir)

    // Create matcher
    const matchPath = createMatchPath(absoluteBaseUrl, paths)

    return matchPath
  } catch (err) {
    return null
  }
}
