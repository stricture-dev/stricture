import type { PresetInfo } from '../types/cli.js'

/**
 * Registry of available Stricture presets
 */
export const PRESET_REGISTRY: PresetInfo[] = [
  {
    id: '@stricture/hexagonal',
    name: 'Hexagonal Architecture',
    description: 'Ports & Adapters pattern with isolated domain logic',
    installed: false,
    recommended: true
  },
  {
    id: '@stricture/clean',
    name: 'Clean Architecture',
    description: 'Layers: Domain → Use Cases → Adapters',
    installed: false,
    recommended: true
  },
  {
    id: '@stricture/layered',
    name: 'Layered Architecture',
    description: 'Traditional layers: Presentation → Business → Data',
    installed: false
  },
  {
    id: '@stricture/modular',
    name: 'Modular Architecture',
    description: 'Feature-based modular organization',
    installed: false
  },
  {
    id: '@stricture/nextjs',
    name: 'Next.js Architecture',
    description: 'Next.js-specific patterns (combine with other presets)',
    installed: false
  },
  {
    id: '@stricture/nestjs',
    name: 'NestJS Architecture',
    description: 'NestJS-specific patterns (combine with other presets)',
    installed: false
  }
]

/**
 * Get preset information by ID
 */
export function getPresetInfo(presetId: string): PresetInfo | undefined {
  return PRESET_REGISTRY.find((p) => p.id === presetId)
}

/**
 * Get all recommended presets
 */
export function getRecommendedPresets(): PresetInfo[] {
  return PRESET_REGISTRY.filter((p) => p.recommended)
}

/**
 * Load a preset dynamically
 */
export async function loadPreset(presetId: string): Promise<unknown> {
  try {
    // Dynamic import of the preset
    const preset = await import(presetId)
    return preset.default || preset
  } catch (error) {
    throw new Error(
      `Failed to load preset "${presetId}". Make sure it's installed.`
    )
  }
}
