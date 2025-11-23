import {
  hexagonalPreset,
  layeredPreset,
  cleanPreset,
  modularPreset,
  nextjsPreset,
  nestjsPreset
} from '../presets/index.js'

/**
 * Map of preset names to preset objects
 */
const PRESETS: Record<string, import('@stricture/core').ArchPreset> = {
  '@stricture/hexagonal': hexagonalPreset,
  '@stricture/layered': layeredPreset,
  '@stricture/clean': cleanPreset,
  '@stricture/modular': modularPreset,
  '@structurenextjs': nextjsPreset,
  '@stricture/nestjs': nestjsPreset
}

/**
 * Gets a bundled preset by name
 */
function getPreset(presetName: string): import('@stricture/core').ArchPreset {
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
  boundaries: import('@stricture/core').BoundaryDefinition[]
  rules: import('@stricture/core').ArchRule[]
  ignorePatterns?: string[]
}

/**
 * Deep merges preset with user overrides
 */
function mergePresetWithOverrides(
  preset: import('@stricture/core').ArchPreset,
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

    return {
      plugins: ['@stricture'],
      rules: {
        '@stricture/enforce-boundaries': ['error', inlineConfig ? { inlineConfig } : {}] as [
          'error',
          Record<string, unknown>
        ]
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
export function createConfig(preset: import('@stricture/core').ArchPreset) {
  const inlineConfig: InlineConfig = {
    boundaries: preset.boundaries,
    rules: preset.rules
  }

  return {
    plugins: ['@stricture'],
    rules: {
      '@stricture/enforce-boundaries': ['error', { inlineConfig }] as [
        'error',
        Record<string, unknown>
      ]
    }
  }
}

/**
 * Creates a config that reads from .stricture/config.json
 *
 * @example
 * ```js
 * import { createConfigFromFile } from '@stricture/eslint-plugin'
 *
 * export default [createConfigFromFile()]
 * ```
 */
export function createConfigFromFile(configPath?: string) {
  return {
    plugins: ['@stricture'],
    rules: {
      '@stricture/enforce-boundaries': [
        'error',
        configPath ? { configPath } : {}
      ] as ['error', Record<string, unknown>]
    }
  }
}
