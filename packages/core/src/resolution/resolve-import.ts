import path from 'path'
import {
  normalizePath,
  isRelativeImport,
  isAbsoluteImport,
  cleanImportSpec,
  addExtensionIfMissing,
  matchPathAlias
} from './path-utils.js'

/**
 * Resolves an import specifier to an absolute file path
 *
 * Handles:
 * - Relative imports: '../domain/user' → resolve relative to fromPath
 * - Path aliases: '@/core/domain' → resolve via tsconfigPaths parameter
 * - Node modules: 'lodash' → return as 'node_modules/lodash' (marked as external)
 * - Extensions: Add .ts, .tsx, .js if missing and file exists
 *
 * External detection:
 * - If import doesn't start with . or / and isn't in tsconfigPaths → external
 * - Return `node_modules/{importSpecifier}` to mark as external
 */
export function resolveImportPath(
  fromPath: string,
  importSpecifier: string,
  baseDir: string,
  tsconfigPaths?: Record<string, string[]>
): string {
  // Clean import specifier (remove query params, fragments)
  const cleanSpec = cleanImportSpec(importSpecifier)

  if (!cleanSpec) {
    return 'node_modules/' // Empty imports treated as external
  }

  // Normalize paths for consistent handling
  const normalizedFromPath = normalizePath(fromPath)
  const normalizedBaseDir = normalizePath(baseDir)

  // Handle relative imports
  if (isRelativeImport(cleanSpec)) {
    const fromDir = path.dirname(normalizedFromPath)
    const resolved = path.resolve(fromDir, cleanSpec)
    const normalized = normalizePath(resolved)
    return addExtensionIfMissing(normalized)
  }

  // Handle absolute imports (starting with /)
  if (isAbsoluteImport(cleanSpec)) {
    // Treat as relative to baseDir
    const resolved = path.resolve(normalizedBaseDir, cleanSpec.replace(/^\//, ''))
    const normalized = normalizePath(resolved)
    return addExtensionIfMissing(normalized)
  }

  // Try path aliases first (before treating as external)
  if (tsconfigPaths) {
    const aliasMatch = matchPathAlias(cleanSpec, tsconfigPaths)

    if (aliasMatch) {
      // Resolve alias relative to baseDir
      const resolved = path.resolve(normalizedBaseDir, aliasMatch)
      const normalized = normalizePath(resolved)
      return addExtensionIfMissing(normalized)
    }
  }

  // If not relative, not absolute, and not in tsconfig paths → external dependency
  // Return as node_modules/{specifier} to mark as external
  return `node_modules/${cleanSpec}`
}
