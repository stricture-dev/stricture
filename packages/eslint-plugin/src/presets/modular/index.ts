import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries.js'
import { rules } from './rules.js'
import { diagram } from './diagram.js'
import { scaffolding } from './scaffolding.js'

/**
 * Modular Architecture (Feature-based) preset for Stricture
 *
 * Enforces feature-based modular architecture where code is organized
 * into vertical slices (modules) with explicit public APIs and strong encapsulation.
 */
export const modularPreset: ArchPreset = {
  id: '@stricture/modular',
  name: 'Modular Architecture',
  description: 'Feature-based modules with explicit public APIs and strong encapsulation',
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default modularPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries.js'
export { rules } from './rules.js'
export { diagram } from './diagram.js'
export { scaffolding } from './scaffolding.js'

// Re-export types
export type {
  Module,
  FeatureModule,
  SharedUtility,
  PublicAPI,
  ModuleDependency,
  ModuleMetadata
} from './types.js'
