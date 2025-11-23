import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries.js'
import { rules } from './rules.js'
import { diagram } from './diagram.js'
import { scaffolding } from './scaffolding.js'

/**
 * Layered Architecture (N-tier) preset for Stricture
 * 
 * Enforces classic layered architecture where dependencies flow
 * strictly from top to bottom: Presentation → Application → Domain → Infrastructure
 */
export const layeredPreset: ArchPreset = {
  id: '@stricture/layered',
  name: 'Layered Architecture',
  description: 'Classic N-tier architecture with strict layer dependencies',
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default layeredPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries.js'
export { rules } from './rules.js'
export { diagram } from './diagram.js'
export { scaffolding } from './scaffolding.js'

// Re-export types
export type {
  Layer,
  Entity,
  Service,
  UseCase,
  Repository,
  ValueObject,
  DomainService,
  Controller,
  DTO
} from './types.js'
