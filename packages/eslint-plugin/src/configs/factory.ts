import boundaries from 'eslint-plugin-boundaries'
import {
  hexagonalPreset,
  layeredPreset,
  cleanPreset,
  modularPreset,
  nextjsPreset,
  nestjsPreset
} from '../presets/index.js'
import { translateConfig } from '@stricture/core'
import type { ArchPreset, BoundaryDefinition, ArchRule, StrictureConfig } from '@stricture/core'

/**
 * Map of preset names to preset objects
 */
const PRESETS: Record<string, ArchPreset> = {
  '@stricture/hexagonal': hexagonalPreset,
  '@stricture/layered': layeredPreset,
  '@stricture/clean': cleanPreset,
  '@stricture/modular': modularPreset,
  '@stricture/nextjs': nextjsPreset,
  '@stricture/nestjs': nestjsPreset
}

/**
 * Gets a bundled preset by name
 */
function getPreset(presetName: string): ArchPreset {
  const preset = PRESETS[presetName]
  if (!preset) {
    throw new Error(
      `Unknown preset "${presetName}". ` +
        `Available presets: ${Object.keys(PRESETS).join(', ')}`
    )
  }
  return preset
}

/**
 * Type for inline configuration passed to ESLint rule
 */
type InlineConfig = {
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  ignorePatterns?: string[]
}

/**
 * Deep merges preset with user overrides
 */
function mergePresetWithOverrides(
  preset: ArchPreset,
  overrides?: Partial<InlineConfig>
): InlineConfig {
  if (!overrides) {
    return {
      boundaries: preset.boundaries,
      rules: preset.rules
    }
  }

  const result: InlineConfig = {
    boundaries: [...preset.boundaries, ...(overrides.boundaries ?? [])],
    rules: [...preset.rules, ...(overrides.rules ?? [])]
  }

  if (overrides.ignorePatterns) {
    result.ignorePatterns = overrides.ignorePatterns
  }

  return result
}

/**
 * Creates an ESLint config object with Stricture configuration
 *
 * This factory now translates Stricture configuration to eslint-plugin-boundaries
 * format, leveraging boundaries as the enforcement engine while maintaining
 * Stricture's developer experience.
 */
export function createConfigFactory(presetName?: string) {
  return function (overrides?: Partial<InlineConfig>) {
    let inlineConfig: InlineConfig | undefined

    if (presetName) {
      // Load bundled preset and merge with overrides
      const preset = getPreset(presetName)
      inlineConfig = mergePresetWithOverrides(preset, overrides)
    } else if (overrides) {
      // No preset, just use overrides as config
      inlineConfig = overrides as InlineConfig
    }

    // If we have inline config, translate it to boundaries format
    if (inlineConfig) {
      const strictureConfig = {
        preset: presetName ?? 'custom',
        boundaries: inlineConfig.boundaries,
        rules: inlineConfig.rules
      }

      // Translate Stricture config to boundaries format
      const { config: boundariesConfig, context } = translateConfig(strictureConfig, {
        denyByDefault: true,
        includeExternal: true
      })

      // Log warnings in development
      if (context.warnings.length > 0 && process.env['NODE_ENV'] !== 'production') {
        console.warn('[Stricture] Translation warnings:', context.warnings)
      }

      // Return ESLint config using boundaries plugin
      return {
        plugins: {
          boundaries
        },
        settings: boundariesConfig.settings,
        rules: boundariesConfig.rules
      }
    }

    // No inline config - will read from .stricture/config.json
    // For this case, we still need to provide a way to load and translate the config
    // This is handled in the rule itself (see enforce-boundaries.ts)
    return {
      plugins: {
        '@stricture': {
          rules: {
            'enforce-boundaries': {
              meta: {
                type: 'problem',
                docs: {
                  description: 'Enforce architectural boundaries (legacy mode - loads .stricture/config.json)',
                  category: 'Possible Errors',
                  recommended: true
                }
              },
              create: () => ({})  // Will be populated by actual rule
            }
          }
        }
      },
      rules: {
        '@stricture/enforce-boundaries': 'error'
      }
    }
  }
}

/**
 * Creates a config from a custom ArchPreset object
 * Useful for third-party presets
 *
 * @example
 * ```js
 * import { createConfig } from '@stricture/eslint-plugin'
 * import acmePreset from '@acme/stricture-preset-custom'
 *
 * export default [createConfig(acmePreset)]
 * ```
 */
export function createConfig(preset: ArchPreset) {
  const strictureConfig = {
    preset: preset.id ?? 'custom',
    boundaries: preset.boundaries,
    rules: preset.rules
  }

  // Translate to boundaries format
  const { config: boundariesConfig, context } = translateConfig(strictureConfig, {
    denyByDefault: true,
    includeExternal: true
  })

  // Log warnings in development
  if (context.warnings.length > 0 && process.env['NODE_ENV'] !== 'production') {
    console.warn('[Stricture] Translation warnings:', context.warnings)
  }

  // Return ESLint config using boundaries plugin
  return {
    plugins: {
      boundaries
    },
    settings: boundariesConfig.settings,
    rules: boundariesConfig.rules
  }
}

/**
 * Creates a config that reads from .stricture/config.json and translates to boundaries
 *
 * @example
 * ```js
 * import { createConfigFromFile } from '@stricture/eslint-plugin'
 *
 * export default [createConfigFromFile()]
 * ```
 */
export function createConfigFromFile(configPath = '.stricture/config.json') {
  // Load config file
  const fs = require('fs')
  const path = require('path')

  let strictureConfig: StrictureConfig
  try {
    const configFile = path.resolve(process.cwd(), configPath)
    const configContent = fs.readFileSync(configFile, 'utf-8')
    const rawConfig = JSON.parse(configContent)

    // If config references a preset, load it
    if (rawConfig.preset && !rawConfig.boundaries) {
      const preset = PRESETS[rawConfig.preset]
      if (!preset) {
        throw new Error(`Unknown preset: ${rawConfig.preset}`)
      }
      strictureConfig = {
        preset: rawConfig.preset,
        boundaries: preset.boundaries,
        rules: preset.rules,
        ...rawConfig
      }
    } else {
      strictureConfig = rawConfig
    }
  } catch (err) {
    throw new Error(
      `Failed to load Stricture config from ${configPath}: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  // Translate to boundaries format
  const { config: boundariesConfig, context } = translateConfig(strictureConfig, {
    denyByDefault: true,
    includeExternal: true
  })

  // Log warnings in development
  if (context.warnings.length > 0 && process.env['NODE_ENV'] !== 'production') {
    console.warn('[Stricture] Translation warnings:', context.warnings)
  }

  // Return ESLint config using boundaries plugin
  return {
    plugins: {
      boundaries
    },
    settings: boundariesConfig.settings,
    rules: boundariesConfig.rules
  }
}
