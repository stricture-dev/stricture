import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries.js'
import { rules } from './rules.js'
import { diagram } from './diagram.js'
import { scaffolding } from './scaffolding.js'

/**
 * Clean Architecture preset
 *
 * Implements Uncle Bob's Clean Architecture with the Dependency Rule:
 * all source code dependencies point INWARD toward entities.
 *
 * The four concentric circles:
 * - Entities: Enterprise business rules (innermost)
 * - Use Cases: Application business rules
 * - Interface Adapters: Controllers, gateways, presenters
 * - Frameworks & Drivers: External agencies (outermost)
 *
 * @example
 * ```typescript
 * import { cleanPreset } from '@stricture/clean'
 *
 * export default {
 *   preset: cleanPreset,
 *   // Additional customization...
 * }
 * ```
 */
export const cleanPreset: ArchPreset = {
  id: '@stricture/clean',
  name: 'Clean Architecture',
  description: "Uncle Bob's Clean Architecture with the Dependency Rule",
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default cleanPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries.js'
export { rules } from './rules.js'
export { diagram } from './diagram.js'
export { scaffolding } from './scaffolding.js'

// Re-export types
export type {
  CleanArchitectureLayer,
  Entity,
  ValueObject,
  UseCase,
  InputPort,
  OutputPort,
  Gateway,
  Controller,
  Presenter,
  RequestModel,
  ResponseModel,
  ViewModel
} from './types.js'
