import type { StrictureConfig } from '../types/config.js'
import type { ArchPreset } from '../types/preset.js'
import { mergeBoundaries } from './merge-boundaries.js'
import { mergeRules } from './merge-rules.js'

/**
 * Resolves a configuration by merging in extended presets
 *
 * Algorithm (from SPEC.md lines 556-584):
 * 1. Start with base preset
 * 2. Merge extended presets
 * 3. Apply project-specific boundaries and rules
 * 4. Apply overrides
 */
export function resolveConfig(
  config: StrictureConfig,
  presets: Map<string, ArchPreset>
): StrictureConfig {
  // 1. Start with base preset
  const basePreset = presets.get(config.preset)

  if (!basePreset) {
    throw new Error(`Preset not found: ${config.preset}`)
  }

  let resolvedBoundaries = [...basePreset.boundaries]
  let resolvedRules = [...basePreset.rules]

  // 2. Merge extended presets
  if (config.extends) {
    for (const extendId of config.extends) {
      const extendPreset = presets.get(extendId)

      if (!extendPreset) {
        throw new Error(`Extended preset not found: ${extendId}`)
      }

      resolvedBoundaries = mergeBoundaries(
        resolvedBoundaries,
        extendPreset.boundaries
      )
      resolvedRules = mergeRules(resolvedRules, extendPreset.rules)
    }
  }

  // 3. Apply project-specific boundaries and rules
  resolvedBoundaries = mergeBoundaries(resolvedBoundaries, config.boundaries || [])
  resolvedRules = mergeRules(resolvedRules, config.rules || [])

  // 4. Apply overrides
  if (config.overrides) {
    for (const override of config.overrides) {
      const index = resolvedRules.findIndex(r => r.id === override.id)

      if (index >= 0) {
        // Merge override with existing rule
        const existingRule = resolvedRules[index]
        if (existingRule) {
          resolvedRules[index] = {
            ...existingRule,
            ...override
          }
        }
      }
    }
  }

  return {
    ...config,
    boundaries: resolvedBoundaries,
    rules: resolvedRules
  }
}
