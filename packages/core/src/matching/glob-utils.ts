import micromatch from 'micromatch'

export function matchGlob(filePath: string, pattern: string): boolean {
  if (!pattern) {
    return false
  }

  let normalizedPattern = pattern
  if (!pattern.startsWith('/') && !pattern.startsWith('**/') && !pattern.startsWith('./')) {
    normalizedPattern = `**/${pattern}`
  }

  return micromatch.isMatch(filePath, normalizedPattern, { dot: true })
}

export function matchesExclusion(filePath: string, excludePatterns: string[]): boolean {
  if (!excludePatterns || excludePatterns.length === 0) {
    return false
  }
  return excludePatterns.some(pattern => micromatch.isMatch(filePath, pattern, { dot: true }))
}

export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}
