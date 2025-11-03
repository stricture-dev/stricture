/**
 * Normalize path separators for consistent handling
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

/**
 * Check if an import specifier is a relative import
 */
export function isRelativeImport(importSpec: string): boolean {
  return importSpec.startsWith('./') || importSpec.startsWith('../')
}

/**
 * Check if an import specifier is an absolute import
 */
export function isAbsoluteImport(importSpec: string): boolean {
  return importSpec.startsWith('/') || /^[A-Z]:/i.test(importSpec)
}

/**
 * Remove query parameters and fragments from import specifier
 */
export function cleanImportSpec(importSpec: string): string {
  return importSpec.split('?')[0].split('#')[0]
}

/**
 * Try to add file extensions to a path if it doesn't have one
 */
export function addExtensionIfMissing(filePath: string): string {
  const hasExtension = /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath)

  if (hasExtension) {
    return filePath
  }

  // Default to .ts for TypeScript projects
  // In a real implementation, you might check if files exist
  return `${filePath}.ts`
}

/**
 * Check if import specifier matches a tsconfig path alias
 */
export function matchPathAlias(
  importSpec: string,
  tsconfigPaths?: Record<string, string[]>
): string | null {
  if (!tsconfigPaths) {
    return null
  }

  for (const [alias, paths] of Object.entries(tsconfigPaths)) {
    // Remove trailing /* from alias pattern
    const aliasPattern = alias.replace(/\/\*$/, '')

    if (importSpec === aliasPattern || importSpec.startsWith(`${aliasPattern}/`)) {
      // Take first path (ignore multiple paths for simplicity)
      const targetPath = paths[0].replace(/\/\*$/, '')

      // Replace alias with target path
      const resolvedPath = importSpec.replace(aliasPattern, targetPath)

      return resolvedPath
    }
  }

  return null
}
