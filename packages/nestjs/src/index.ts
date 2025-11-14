import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries.js'
import { rules } from './rules.js'
import { diagram } from './diagram.js'
import { scaffolding } from './scaffolding.js'

/**
 * NestJS Architecture preset
 *
 * Enforces NestJS best practices:
 * - DTOs and Controllers cannot import Entities (API/DB separation)
 * - Controllers call Services, not Repositories (layered architecture)
 * - Controllers are independent (no cross-controller dependencies)
 * - Services handle business logic and use Repositories
 * - Cross-cutting concerns (guards, pipes, etc.) available everywhere
 *
 * @example
 * ```typescript
 * import { nestjsPreset } from '@stricture/nestjs'
 *
 * export default {
 *   preset: nestjsPreset,
 *   // Additional customization...
 * }
 * ```
 */
export const nestjsPreset: ArchPreset = {
  id: '@stricture/nestjs',
  name: 'NestJS Architecture',
  description: 'NestJS best practices with module encapsulation and proper layering',
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default nestjsPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries.js'
export { rules } from './rules.js'
export { diagram } from './diagram.js'
export { scaffolding } from './scaffolding.js'

// Re-export types
export type {
  NestJSBoundary,
  ModuleDefinition,
  ControllerDefinition,
  ServiceDefinition,
  DTODefinition,
  EntityDefinition
} from './types.js'
