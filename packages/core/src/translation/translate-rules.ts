import type { ArchRule } from '../types/rule.js'
import type { BoundaryDefinition } from '../types/boundary.js'
import type {
  BoundariesElementTypesRule,
  BoundariesElementsSelector,
  BoundariesExternalRule
} from './boundaries-types.js'
import { createTagToBoundaryMap } from './translate-boundaries.js'

/**
 * Calculate specificity score for a Stricture rule
 * This implements the same algorithm as validateImport.ts
 *
 * Higher score = more specific = should come first in boundaries rules array
 *
 * Scoring system:
 * - Specific node_modules pattern (not **): 10000
 * - Regular pattern: 1000
 * - Specific tag: 100
 * - Wildcard (*): 1
 */
function calculateRuleSpecificity(rule: ArchRule): number {
  let score = 0

  // Calculate 'from' specificity
  if (rule.from.pattern) {
    if (rule.from.pattern.includes('node_modules/') && !rule.from.pattern.includes('**')) {
      score += 10000
    } else if (rule.from.pattern === '**' || rule.from.pattern === '*') {
      score += 1
    } else {
      score += 1000
    }
  } else if (rule.from.tag) {
    if (rule.from.tag === '*') {
      score += 1
    } else {
      score += 100
    }
  }

  // Calculate 'to' specificity (same logic)
  if (rule.to.pattern) {
    if (rule.to.pattern.includes('node_modules/') && !rule.to.pattern.includes('**')) {
      score += 10000
    } else if (rule.to.pattern === '**' || rule.to.pattern === '*') {
      score += 1
    } else {
      score += 1000
    }
  } else if (rule.to.tag) {
    if (rule.to.tag === '*') {
      score += 1
    } else {
      score += 100
    }
  }

  return score
}

/**
 * Translates Stricture rules to eslint-plugin-boundaries rules
 *
 * Key translations:
 * - Stricture rules are sorted by specificity (highest first)
 * - Boundaries rules rely on array order (first match wins)
 * - Stricture's deny-by-default becomes boundaries' `default: 'disallow'`
 * - Tag selectors are expanded to boundary name selectors
 * - Wildcard rules (* tag) are expanded to all boundaries
 * - Pattern-based 'to' selectors need dedicated element descriptors
 *
 * @param rules Stricture rule definitions
 * @param boundaries Stricture boundary definitions
 * @returns Boundaries element-types rules and external rules
 */
export function translateRules(
  rules: ArchRule[],
  boundaries: BoundaryDefinition[]
): {
  elementTypesRules: BoundariesElementTypesRule[]
  externalRules: BoundariesExternalRule[]
  warnings: string[]
} {
  const elementTypesRules: BoundariesElementTypesRule[] = []
  const externalRules: BoundariesExternalRule[] = []
  const warnings: string[] = []

  // Create tag → boundary name mapping
  const tagMap = createTagToBoundaryMap(boundaries)

  // Sort rules by specificity (highest first)
  // This is crucial because boundaries uses first-match-wins
  const sortedRules = [...rules].sort((a, b) => {
    return calculateRuleSpecificity(b) - calculateRuleSpecificity(a)
  })

  for (const rule of sortedRules) {
    // Skip rules with severity 'off'
    if (rule.severity === 'off') {
      continue
    }

    // Translate from selector
    const fromSelector = translateSelector(rule.from, tagMap, boundaries, warnings)
    if (!fromSelector) {
      warnings.push(`Rule ${rule.id}: Could not translate 'from' selector`)
      continue
    }

    // Check if this is an external dependency rule
    const isExternalRule = rule.to.tag === 'external' ||
      (rule.to.pattern && rule.to.pattern.includes('node_modules'))

    if (isExternalRule) {
      // Translate to boundaries/external rule
      const externalRule = translateToExternalRule(rule, fromSelector)
      if (externalRule) {
        externalRules.push(externalRule)
      }
    } else {
      // Translate to boundaries/element-types rule
      const elementRule = translateToElementTypesRule(rule, fromSelector, tagMap, boundaries, warnings)
      if (elementRule) {
        elementTypesRules.push(elementRule)
      }
    }
  }

  return { elementTypesRules, externalRules, warnings }
}

/**
 * Translate a Stricture BoundaryPattern to boundaries ElementsSelector
 */
function translateSelector(
  pattern: { pattern?: string; tag?: string; mode: 'file' | 'folder' },
  tagMap: Map<string, string[]>,
  boundaries: BoundaryDefinition[],
  warnings: string[]
): BoundariesElementsSelector | null {
  // Tag selector - expand to boundary names
  if (pattern.tag) {
    if (pattern.tag === '*') {
      // Wildcard - expand to all boundary names
      return boundaries.map(b => b.name)
    }

    // Lookup tag in map
    const boundaryNames = tagMap.get(pattern.tag)
    if (!boundaryNames || boundaryNames.length === 0) {
      warnings.push(`Tag '${pattern.tag}' not found in any boundary`)
      return null
    }

    // Deduplicate boundary names
    const uniqueNames = Array.from(new Set(boundaryNames))

    // Return array of boundary names if multiple, single string if one
    return uniqueNames.length === 1 ? uniqueNames[0]! : uniqueNames
  }

  // Pattern selector - needs dedicated element or complex matching
  if (pattern.pattern) {
    // For external patterns, return 'external'
    if (pattern.pattern.includes('node_modules')) {
      return 'external'
    }

    // For other patterns, we need to find a matching boundary
    // or create a dedicated element descriptor
    const matchingBoundary = boundaries.find(b => b.pattern === pattern.pattern)
    if (matchingBoundary) {
      return matchingBoundary.name
    }

    // Pattern doesn't match any existing boundary
    // This requires creating a dedicated element descriptor
    warnings.push(
      `Pattern '${pattern.pattern}' doesn't match any boundary. ` +
      `Consider creating a dedicated boundary for this pattern.`
    )
    return null
  }

  return null
}

/**
 * Translate Stricture rule to boundaries element-types rule
 */
function translateToElementTypesRule(
  rule: ArchRule,
  fromSelector: BoundariesElementsSelector,
  tagMap: Map<string, string[]>,
  boundaries: BoundaryDefinition[],
  warnings: string[]
): BoundariesElementTypesRule | null {
  // Translate to selector
  const toSelector = translateSelector(rule.to, tagMap, boundaries, warnings)
  if (!toSelector) {
    return null
  }

  // Create rule
  const boundariesRule: BoundariesElementTypesRule = {
    from: fromSelector
  }

  // Set allow/disallow
  if (rule.allowed) {
    boundariesRule.allow = toSelector
  } else {
    boundariesRule.disallow = toSelector
  }

  // Add custom message if present
  if (rule.message) {
    boundariesRule.message = enhanceMessage(rule)
  }

  return boundariesRule
}

/**
 * Translate Stricture rule to boundaries external rule
 */
function translateToExternalRule(
  rule: ArchRule,
  fromSelector: BoundariesElementsSelector
): BoundariesExternalRule | null {
  // External rules use '*' to mean all external libraries
  const externalRule: BoundariesExternalRule = {
    from: fromSelector
  }

  // Set allow/disallow for external dependencies
  if (rule.allowed) {
    externalRule.allow = ['*']  // Allow all external
  } else {
    externalRule.disallow = ['*']  // Disallow all external
  }

  // Add custom message if present
  if (rule.message) {
    externalRule.message = enhanceMessage(rule)
  }

  return externalRule
}

/**
 * Enhance error message with examples
 */
function enhanceMessage(rule: ArchRule): string {
  let message = rule.message ?? rule.description

  // Add examples if present
  if (rule.examples) {
    if (rule.examples.bad && rule.examples.bad.length > 0) {
      message += '\n\n❌ Bad:\n' + rule.examples.bad.map(ex => `  ${ex}`).join('\n')
    }
    if (rule.examples.good && rule.examples.good.length > 0) {
      message += '\n\n✅ Good:\n' + rule.examples.good.map(ex => `  ${ex}`).join('\n')
    }
  }

  return message
}

/**
 * Generate catch-all deny rule for deny-by-default behavior
 *
 * When Stricture's deny-by-default is enabled, we need a catch-all rule
 * at the end of the rules array to deny anything not explicitly allowed.
 *
 * However, boundaries' `default: 'disallow'` option provides this behavior,
 * so we don't need to generate explicit rules.
 *
 * This function is kept for reference and potential future use.
 */
export function generateCatchAllDenyRule(): BoundariesElementTypesRule {
  return {
    from: '*',
    disallow: ['*'],
    message: 'No architectural rule defined for this import. ' +
      'Stricture uses deny-by-default policy. ' +
      'Add an explicit rule to allow this import.'
  }
}
