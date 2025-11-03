import type { ArchRule } from '../types/rule.js'

/**
 * Merges two sets of rules
 *
 * Merge strategy (from SPEC.md):
 * - Override replaces base if IDs match
 * - Preserve severity changes
 * - Maintain rule order
 */
export function mergeRules(
  base: ArchRule[],
  override: ArchRule[]
): ArchRule[] {
  // Start with a copy of base rules
  const result: ArchRule[] = [...base]

  // Process each override
  for (const overrideRule of override) {
    // Find if there's a matching rule in base (by ID)
    const existingIndex = result.findIndex(r => r.id === overrideRule.id)

    if (existingIndex >= 0) {
      // Replace existing rule
      result[existingIndex] = overrideRule
    } else {
      // Add new rule
      result.push(overrideRule)
    }
  }

  return result
}
