import type { BoundaryDefinition } from '../types/boundary.js'
import type { BoundariesElementDescriptor } from './boundaries-types.js'

/**
 * Translates Stricture boundary definitions to eslint-plugin-boundaries element descriptors
 *
 * Key translations:
 * - Stricture boundary.name → boundaries element.type
 * - Stricture boundary.pattern → boundaries element.pattern (unchanged)
 * - Stricture boundary.mode → boundaries element.mode (unchanged)
 * - Stricture boundary.tags → Lost (boundaries only supports single type)
 * - Stricture boundary.metadata → Lost (boundaries doesn't support metadata)
 *
 * @param boundaries Stricture boundary definitions
 * @param includeExternal Whether to include virtual "external" boundary for node_modules
 * @returns Array of boundaries element descriptors
 */
export function translateBoundaries(
  boundaries: BoundaryDefinition[],
  includeExternal = true
): BoundariesElementDescriptor[] {
  const elements: BoundariesElementDescriptor[] = []

  // Translate each Stricture boundary to a boundaries element
  for (const boundary of boundaries) {
    elements.push({
      type: boundary.name,  // Use name as type
      pattern: boundary.pattern,
      mode: boundary.mode === 'file' ? 'file' : 'folder'
    })

    // Note: Multi-tag support is lost in translation
    // Stricture: { name: 'driving-adapters', tags: ['adapters', 'driving'] }
    // Boundaries: { type: 'driving-adapters' }
    // Rules that reference tags will need to be updated to use the name instead
  }

  // Auto-inject "external" boundary for node_modules
  // This simulates Stricture's automatic external dependency detection
  if (includeExternal) {
    elements.push({
      type: 'external',
      pattern: 'node_modules/**',
      mode: 'file'
    })
  }

  return elements
}

/**
 * Generates comments describing a boundary's metadata
 * These comments can be included in the generated ESLint config
 *
 * @param boundary Stricture boundary definition
 * @returns Array of comment strings
 */
export function generateBoundaryComments(boundary: BoundaryDefinition): string[] {
  const comments: string[] = []

  // Add name as primary comment
  comments.push(`BOUNDARY: ${boundary.name}`)

  // Add description if present
  if (boundary.metadata?.description) {
    comments.push(`Description: ${boundary.metadata.description}`)
  }

  // Add layer if present
  if (typeof boundary.metadata?.layer === 'number') {
    comments.push(`Layer: ${boundary.metadata.layer}`)
  }

  // Add tags if present
  if (boundary.tags && boundary.tags.length > 0) {
    comments.push(`Tags: ${boundary.tags.join(', ')}`)
  }

  // Add custom metadata fields
  if (boundary.metadata) {
    for (const [key, value] of Object.entries(boundary.metadata)) {
      if (key !== 'description' && key !== 'layer') {
        comments.push(`${key}: ${String(value)}`)
      }
    }
  }

  return comments
}

/**
 * Create a tag-to-name mapping for translating rules
 *
 * Since boundaries only supports single type, we need to map Stricture's tags
 * to boundary names for rule translation.
 *
 * Strategy:
 * - If a boundary has multiple tags, we map all tags to the boundary name
 * - This allows rules like `from: { tag: 'adapters' }` to be translated to
 *   multiple from selectors in boundaries
 *
 * @param boundaries Stricture boundary definitions
 * @returns Map of tag → boundary names
 */
export function createTagToBoundaryMap(
  boundaries: BoundaryDefinition[]
): Map<string, string[]> {
  const tagMap = new Map<string, string[]>()

  for (const boundary of boundaries) {
    if (boundary.tags && boundary.tags.length > 0) {
      for (const tag of boundary.tags) {
        const existing = tagMap.get(tag) ?? []
        existing.push(boundary.name)
        tagMap.set(tag, existing)
      }
    }

    // Also map the boundary name to itself for consistency
    const existing = tagMap.get(boundary.name) ?? []
    existing.push(boundary.name)
    tagMap.set(boundary.name, existing)
  }

  return tagMap
}
