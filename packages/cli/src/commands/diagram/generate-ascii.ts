import type { StrictureConfig } from '@stricture/core'

/**
 * Generate ASCII diagram from config
 */
export function generateAsciiDiagram(config: StrictureConfig): string {
  const lines: string[] = []

  lines.push('Architecture Diagram')
  lines.push('===================')
  lines.push('')

  // List boundaries
  lines.push('Boundaries:')
  for (const boundary of config.boundaries) {
    lines.push(`  ┌─ ${boundary.name}`)
    lines.push(`  │  Pattern: ${boundary.pattern}`)
    if (boundary.tags && boundary.tags.length > 0) {
      lines.push(`  │  Tags: ${boundary.tags.join(', ')}`)
    }
    lines.push(`  └─`)
  }

  lines.push('')

  // List allowed dependencies
  lines.push('Allowed Dependencies:')

  const allowedRules = config.rules.filter((r: { allowed?: boolean }) => r.allowed)

  if (allowedRules.length === 0) {
    lines.push('  (none)')
  } else {
    for (const rule of allowedRules) {
      const fromDesc = rule.from.tag || rule.from.pattern || 'any'
      const toDesc = rule.to.tag || rule.to.pattern || 'any'
      lines.push(`  ${fromDesc} → ${toDesc}`)
    }
  }

  return lines.join('\n')
}
