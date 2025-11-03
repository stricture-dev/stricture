import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries'
import { rules } from './rules'
import { diagram } from './diagram'
import { scaffolding } from './scaffolding'

/**
 * Hexagonal Architecture (Ports & Adapters) preset
 *
 * Enforces clean separation between:
 * - Domain: Pure business logic (no external dependencies)
 * - Ports: Interface definitions for external interactions
 * - Application: Use cases that orchestrate domain and ports
 * - Adapters: Infrastructure implementations of ports
 *
 * @example
 * ```typescript
 * import { hexagonalPreset } from '@stricture/hexagonal'
 *
 * export default {
 *   preset: hexagonalPreset,
 *   // Additional customization...
 * }
 * ```
 */
export const hexagonalPreset: ArchPreset = {
  id: '@stricture/hexagonal',
  name: 'Hexagonal Architecture',
  description: 'Ports & Adapters pattern with isolated domain logic',
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default hexagonalPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries'
export { rules } from './rules'
export { diagram } from './diagram'
export { scaffolding } from './scaffolding'

// Re-export types
export type {
  HexagonalBoundary,
  PortDefinition,
  AdapterDefinition,
  DomainEntity,
  UseCase
} from './types'
