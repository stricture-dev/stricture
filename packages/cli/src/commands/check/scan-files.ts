import { findFiles } from '../../utils/file-utils.js'

/**
 * Scan project for TypeScript/JavaScript files
 */
export async function scanFiles(
  root: string,
  ignorePatterns: string[] = []
): Promise<string[]> {
  // Find all TypeScript and JavaScript files
  const pattern = /\.(ts|tsx|js|jsx|mjs|cjs)$/

  const files = await findFiles(root, pattern)

  // Filter out ignored patterns
  const filtered = files.filter((file) => {
    return !ignorePatterns.some((pattern) => file.includes(pattern))
  })

  return filtered
}
