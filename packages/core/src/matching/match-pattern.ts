import path from 'path'
import type { BoundaryPattern, BoundaryDefinition } from '../types/boundary.js'
import { matchGlob, matchesExclusion, normalizePath } from './glob-utils.js'

/**
 * Checks if a file path matches a boundary pattern
 *
 * Algorithm from SPEC.md:
 * 1. Resolve tag to pattern if needed
 * 2. Check exclusions first
 * 3. Check pattern match based on mode (file or folder)
 */
export function matchesPattern(
  filePath: string,
  pattern: BoundaryPattern,
  boundaries?: BoundaryDefinition[]
): boolean {
  // Normalize path for consistent matching
  const normalizedPath = normalizePath(filePath)

  // 1. Resolve tag to pattern if needed
  let effectivePattern = pattern.pattern

  if (pattern.tag) {
    if (!boundaries) {
      return false
    }

    // Find boundary by name or by tag in tags array
    const boundary = boundaries.find(
      b => b.name === pattern.tag || (pattern.tag && b.tags?.includes(pattern.tag))
    )

    if (!boundary) {
      return false
    }

    effectivePattern = boundary.pattern
  }

  // Need a pattern to match against
  if (!effectivePattern) {
    return false
  }

  // 2. Check exclusions first
  if (pattern.exclude && matchesExclusion(normalizedPath, pattern.exclude)) {
    return false
  }

  // 3. Check pattern match based on mode
  if (pattern.mode === 'folder') {
    // Match entire directory
    const dirPath = path.dirname(normalizedPath)
    return matchGlob(dirPath, effectivePattern)
  } else {
    // Match file
    return matchGlob(normalizedPath, effectivePattern)
  }
}
