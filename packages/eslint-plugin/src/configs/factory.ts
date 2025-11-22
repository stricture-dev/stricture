import type { StrictureConfig } from '@stricture/core'

/**
 * Dynamically loads a preset package
 */
function loadPreset(presetName: string): StrictureConfig {
  try {
    // Dynamic require for preset package
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const preset = require(presetName)
    return preset.default || preset
  } catch (err) {
    throw new Error(
      `Failed to load preset "${presetName}". ` +
        `Make sure it's installed: npm install -D ${presetName}\n` +
        `Error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

/**
 * Deep merges two configs, concatenating arrays
 */
function mergeConfig(
  base: StrictureConfig,
  overrides?: Partial<StrictureConfig>
): StrictureConfig {
  if (!overrides) return base

  return {
    ...base,
    ...overrides,
    boundaries: [...(base.boundaries ?? []), ...(overrides.boundaries ?? [])],
    rules: [...(base.rules ?? []), ...(overrides.rules ?? [])],
    ignorePatterns: [...(base.ignorePatterns ?? []), ...(overrides.ignorePatterns ?? [])]
  }
}

/**
 * Creates an ESLint config object with Stricture configuration
 */
export function createConfigFactory(presetName?: string) {
  return function (overrides?: Partial<StrictureConfig>) {
    let inlineConfig: StrictureConfig | undefined

    if (presetName) {
      // Load preset and merge with overrides
      const preset = loadPreset(presetName)
      inlineConfig = mergeConfig(preset, overrides)
    } else if (overrides) {
      // No preset, just use overrides as config
      inlineConfig = overrides as StrictureConfig
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
