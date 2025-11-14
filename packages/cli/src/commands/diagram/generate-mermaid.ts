import type { StrictureConfig, BoundaryDefinition } from '@stricture/core'

/**
 * Generate Mermaid diagram from config
 */
export function generateMermaidDiagram(config: StrictureConfig): string {
  const lines: string[] = ['graph TD']

  // Add nodes for each boundary
  for (const boundary of config.boundaries) {
    const nodeId = sanitizeId(boundary.name)
    const label = boundary.name
    lines.push(`  ${nodeId}[${label}]`)
  }

  // Add edges from rules
  const edges = new Set<string>()

  for (const rule of config.rules) {
    if (rule.allowed) {
      const from = getBoundaryByPattern(rule.from, config.boundaries)
      const to = getBoundaryByPattern(rule.to, config.boundaries)

      if (from && to && from !== to) {
        const edge = `${sanitizeId(from.name)} --> ${sanitizeId(to.name)}`
        edges.add(edge)
      }
    }
  }

  // Add unique edges
  for (const edge of edges) {
    lines.push(`  ${edge}`)
  }

  return lines.join('\n')
}

/**
 * Sanitize ID for Mermaid
 */
function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_')
}

/**
 * Get boundary from rule pattern
 */
function getBoundaryByPattern(
  pattern: { tag?: string; pattern?: string },
  boundaries: BoundaryDefinition[]
): BoundaryDefinition | null {
  if (pattern.tag) {
    return (
      boundaries.find((b) => b.tags && b.tags.includes(pattern.tag ?? '')) ??
      null
    )
  }

  if (pattern.pattern) {
    return boundaries.find((b) => b.pattern === pattern.pattern) ?? null
  }

  return null
}
