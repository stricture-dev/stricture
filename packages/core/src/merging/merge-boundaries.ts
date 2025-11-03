import type { BoundaryDefinition } from '../types/boundary.js'

/**
 * Merges two sets of boundary definitions (for preset extension)
 *
 * Merge strategy (from SPEC.md):
 * - Override replaces base if names match
 * - Otherwise, concatenate
 * - Preserve order: base first, then overrides
 */
export function mergeBoundaries(
  base: BoundaryDefinition[],
  override: BoundaryDefinition[]
): BoundaryDefinition[] {
  // Start with a copy of base boundaries
  const result: BoundaryDefinition[] = [...base]

  // Process each override
  for (const overrideBoundary of override) {
    // Find if there's a matching boundary in base (by name)
    const existingIndex = result.findIndex(
      b => b.name === overrideBoundary.name
    )

    if (existingIndex >= 0) {
      // Replace existing boundary
      result[existingIndex] = overrideBoundary
    } else {
      // Add new boundary
      result.push(overrideBoundary)
    }
  }

  return result
}
