import type { ImportValidationResult } from '../types/validation.js'
import type { ArchRule } from '../types/rule.js'
import type { BoundaryDefinition, BoundaryPattern } from '../types/boundary.js'
import { matchesPattern } from '../matching/match-pattern.js'

/**
 * This is the core validation engine - validates whether an import statement violates architectural rules
 *
 * Algorithm (from SPEC.md lines 452-521):
 * 1. Detect if target is external dependency (node_modules)
 * 2. Find source boundary
 * 3. Find target boundary (null if external)
 * 4. Check all applicable rules where from matches source boundary
 * 5. For external dependencies, check if there's a rule targeting external imports
 * 6. If rule's to matches target boundary (or external), check if allowed
 * 7. Return violation with helpful message if not allowed
 *
 * External detection:
 * - If toPath contains 'node_modules' → external
 * - Special 'external' tag in rules targets external dependencies
 * - External dependencies allowed by default if no rule targets them
 */
export function validateImport(
  fromPath: string,
  toPath: string,
  rules: ArchRule[],
  boundaries: BoundaryDefinition[]
): ImportValidationResult {
  // 1. Detect if target is external dependency
  const isExternal = toPath.includes('node_modules')

  // 2. Find source boundary
  const fromBoundary = boundaries.find(b =>
    matchesPattern(fromPath, { pattern: b.pattern, mode: b.mode })
  )

  // 3. Find target boundary (create virtual 'external' boundary if external)
  let toBoundary: BoundaryDefinition | undefined

  if (isExternal) {
    // Create virtual external boundary
    toBoundary = {
      name: 'external',
      pattern: 'node_modules/**',
      mode: 'file'
    }
  } else {
    toBoundary = boundaries.find(b =>
      matchesPattern(toPath, { pattern: b.pattern, mode: b.mode })
    )
  }

  // 4. Check all applicable rules
  // Sort rules by specificity: pattern-based rules before tag-based rules
  const sortedRules = [...rules].sort((a, b) => {
    // Pattern-based rules are more specific than tag-based rules
    const aHasPattern = !!a.to.pattern
    const bHasPattern = !!b.to.pattern
    if (aHasPattern && !bHasPattern) return -1
    if (!aHasPattern && bHasPattern) return 1
    return 0
  })

  for (const rule of sortedRules) {
    // Check if rule's from matches source boundary
    const fromMatches = matchesRuleBoundary(
      fromBoundary,
      rule.from,
      boundaries
    )

    // Check if rule's to matches target path/boundary
    // For patterns, check against the actual path; for tags, check against boundary
    const toMatches = matchesRuleBoundaryOrPath(
      toPath,
      toBoundary,
      rule.to,
      boundaries
    )

    if (fromMatches && toMatches) {
      if (!rule.allowed) {
        // Rule forbids this import - return violation
        return {
          valid: false,
          violatedRule: rule,
          fromBoundary: fromBoundary?.name,
          toBoundary: toBoundary?.name,
          message:
            rule.message ||
            buildMessage(fromBoundary, toBoundary, isExternal),
          suggestion: generateSuggestion(rule, isExternal)
        }
      }
      // Rule explicitly allows this import
      return { valid: true }
    }
  }

  // 5. No violations found (or no rule targets this combination)
  // By default, imports are allowed if no rule blocks them
  return { valid: true }
}

/**
 * Check if a boundary matches a rule's boundary pattern
 */
function matchesRuleBoundary(
  boundary: BoundaryDefinition | undefined,
  pattern: BoundaryPattern,
  _boundaries: BoundaryDefinition[]
): boolean {
  // Handle wildcard - matches ANY boundary including external
  if (pattern.pattern === '**' || pattern.tag === '*') {
    return !!boundary // Wildcard matches any boundary that exists
  }

  // Handle special 'external' tag
  if (pattern.tag === 'external') {
    return boundary?.name === 'external'
  }

  // If no boundary found, can't match
  if (!boundary) {
    return false
  }

  // Handle tag matching
  if (pattern.tag) {
    // Match by boundary name or tags array
    return (
      boundary.name === pattern.tag ||
      boundary.tags?.includes(pattern.tag) ||
      false
    )
  }

  // Handle pattern matching
  if (pattern.pattern) {
    // Check if boundary pattern matches rule pattern
    // For simplicity, do exact match on patterns
    // In a more sophisticated implementation, we'd check if files in boundary match the pattern
    return boundary.pattern === pattern.pattern
  }

  return false
}

/**
 * Check if a target path or boundary matches a rule's boundary pattern
 * This variant checks the actual path when a pattern is specified
 */
function matchesRuleBoundaryOrPath(
  toPath: string,
  boundary: BoundaryDefinition | undefined,
  pattern: BoundaryPattern,
  boundaries: BoundaryDefinition[]
): boolean {
  // If pattern is specified, check against the actual path
  if (pattern.pattern) {
    return matchesPattern(toPath, pattern, boundaries)
  }

  // Otherwise use boundary matching
  return matchesRuleBoundary(boundary, pattern, boundaries)
}

/**
 * Build a default error message
 */
function buildMessage(
  from: BoundaryDefinition | undefined,
  to: BoundaryDefinition | undefined,
  isExternal: boolean
): string {
  const fromName = from?.name || 'unknown'
  const toName = to?.name || 'unknown'

  if (isExternal) {
    return `'${fromName}' cannot import external dependencies`
  }

  return `'${fromName}' cannot import from '${toName}'`
}

/**
 * Generate a suggested fix
 */
function generateSuggestion(rule: ArchRule, isExternal: boolean): string {
  if (isExternal) {
    return 'Consider using dependency injection or moving this logic to an adapter layer'
  }

  return `Review your architecture - ${rule.description}`
}
