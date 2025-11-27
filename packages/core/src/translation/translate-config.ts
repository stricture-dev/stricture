import type { StrictureConfig } from '../types/config.js'
import type {
  BoundariesESLintConfig,
  BoundariesElementTypesOptions,
  BoundariesExternalOptions,
  TranslationContext
} from './boundaries-types.js'
import { translateBoundaries, generateBoundaryComments } from './translate-boundaries.js'
import { translateRules } from './translate-rules.js'

/**
 * Translates a complete Stricture configuration to eslint-plugin-boundaries format
 *
 * This is the main entry point for the translation layer. It converts a Stricture
 * configuration (with presets, boundaries, and rules) into an ESLint configuration
 * that uses eslint-plugin-boundaries as the enforcement engine.
 *
 * @param config Stricture configuration (resolved with presets)
 * @param options Translation options
 * @returns Boundaries ESLint configuration and translation context
 */
export function translateConfig(
  config: StrictureConfig,
  options: {
    /** Include virtual 'external' boundary for node_modules */
    includeExternal?: boolean
    /** Use deny-by-default policy */
    denyByDefault?: boolean
    /** Include comments in output (for documentation) */
    includeComments?: boolean
  } = {}
): {
  config: BoundariesESLintConfig
  context: TranslationContext
} {
  const {
    includeExternal = true,
    denyByDefault = true
  } = options

  const warnings: string[] = []
  const limitations: string[] = []

  // Translate boundaries to elements
  const elements = translateBoundaries(config.boundaries, includeExternal)

  // Translate rules
  const { elementTypesRules, externalRules, warnings: ruleWarnings } =
    translateRules(config.rules, config.boundaries)

  warnings.push(...ruleWarnings)

  // Build element-types rule options
  const elementTypesOptions: BoundariesElementTypesOptions = {
    default: denyByDefault ? 'disallow' : 'allow',
    rules: elementTypesRules
  }

  // Build external rule options (if there are external rules)
  const externalOptions: BoundariesExternalOptions | undefined =
    externalRules.length > 0
      ? {
          default: denyByDefault ? 'disallow' : 'allow',
          rules: externalRules
        }
      : undefined

  // Document limitations
  if (config.boundaries.some(b => b.tags && b.tags.length > 1)) {
    limitations.push(
      'Multi-tag boundaries: Stricture boundaries with multiple tags have been ' +
      'mapped to a single type. Rules referencing secondary tags will reference all ' +
      'boundaries with that tag.'
    )
  }

  if (config.boundaries.some(b => b.metadata)) {
    limitations.push(
      'Boundary metadata: Stricture boundary metadata (description, layer, etc.) ' +
      'is not supported by boundaries. This information is lost in translation.'
    )
  }

  if (config.rules.some(r => r.examples)) {
    limitations.push(
      'Rule examples: Stricture rule examples have been embedded in error messages.'
    )
  }

  // Build final configuration
  const boundariesConfig: BoundariesESLintConfig = {
    settings: {
      'boundaries/elements': elements,
      'boundaries/dependency-nodes': ['import', 'require', 'dynamic-import', 'export']
    },
    rules: {
      'boundaries/element-types': [2, elementTypesOptions]
    }
  }

  // Add external rule if present
  if (externalOptions) {
    boundariesConfig.rules!['boundaries/external'] = [2, externalOptions]
  }

  // Build translation context
  const context: TranslationContext = {
    denyByDefault,
    rulesTranslated: elementTypesRules.length + externalRules.length,
    boundariesTranslated: elements.length,
    warnings,
    limitations
  }

  return { config: boundariesConfig, context }
}

/**
 * Generate a human-readable report of the translation
 *
 * This creates documentation showing:
 * - Original Stricture boundaries with metadata
 * - Translated boundaries elements
 * - Original Stricture rules
 * - Translated boundaries rules
 * - Warnings and limitations
 *
 * @param config Stricture configuration
 * @param translatedConfig Boundaries ESLint configuration
 * @param context Translation context
 * @returns Markdown report string
 */
export function generateTranslationReport(
  config: StrictureConfig,
  translatedConfig: BoundariesESLintConfig,
  context: TranslationContext
): string {
  const lines: string[] = []

  lines.push('# Stricture → eslint-plugin-boundaries Translation Report')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- **Boundaries translated:** ${context.boundariesTranslated}`)
  lines.push(`- **Rules translated:** ${context.rulesTranslated}`)
  lines.push(`- **Deny-by-default:** ${context.denyByDefault ? 'Yes' : 'No'}`)
  lines.push(`- **Warnings:** ${context.warnings.length}`)
  lines.push(`- **Limitations:** ${context.limitations.length}`)
  lines.push('')

  // Boundaries section
  lines.push('## Boundaries')
  lines.push('')
  for (const boundary of config.boundaries) {
    const comments = generateBoundaryComments(boundary)
    lines.push(`### ${boundary.name}`)
    lines.push('')
    for (const comment of comments) {
      lines.push(`- ${comment}`)
    }
    lines.push('')
    lines.push('**Pattern:**')
    lines.push('```')
    lines.push(boundary.pattern)
    lines.push('```')
    lines.push('')
  }

  // Rules section
  lines.push('## Rules')
  lines.push('')
  lines.push(`**Total:** ${config.rules.length} rules`)
  lines.push('')
  lines.push('| ID | From | To | Allowed | Severity |')
  lines.push('|----|------|----|---------| -------- |')
  for (const rule of config.rules) {
    const from = rule.from.tag ?? rule.from.pattern ?? '?'
    const to = rule.to.tag ?? rule.to.pattern ?? '?'
    const allowed = rule.allowed ? '✅' : '❌'
    lines.push(`| ${rule.id} | ${from} | ${to} | ${allowed} | ${rule.severity} |`)
  }
  lines.push('')

  // Warnings section
  if (context.warnings.length > 0) {
    lines.push('## Warnings')
    lines.push('')
    for (const warning of context.warnings) {
      lines.push(`- ⚠️  ${warning}`)
    }
    lines.push('')
  }

  // Limitations section
  if (context.limitations.length > 0) {
    lines.push('## Limitations')
    lines.push('')
    for (const limitation of context.limitations) {
      lines.push(`- ℹ️  ${limitation}`)
    }
    lines.push('')
  }

  // Generated config preview
  lines.push('## Generated Configuration Preview')
  lines.push('')
  lines.push('```javascript')
  lines.push(JSON.stringify(translatedConfig, null, 2))
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}
