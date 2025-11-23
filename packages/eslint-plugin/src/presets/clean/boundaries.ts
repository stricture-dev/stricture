import type { BoundaryDefinition } from '@stricture/core'

/**
 * Clean Architecture boundary definitions
 *
 * Defines the four concentric circles of Clean Architecture:
 * - entities: Enterprise business rules (innermost - layer 0)
 * - use-cases: Application business rules (layer 1)
 * - interface-adapters: Interface adapters and controllers (layer 2)
 * - frameworks-drivers: External agencies and frameworks (outermost - layer 3)
 *
 * The Dependency Rule: Source code dependencies must point INWARD only.
 */
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'entities',
    pattern: 'src/entities/**',
    mode: 'file',
    tags: ['entities', 'core'],
    metadata: {
      description: 'Enterprise business rules - entities and domain logic',
      layer: 0 // Innermost layer
    }
  },
  {
    name: 'use-cases',
    pattern: 'src/use-cases/**',
    mode: 'file',
    tags: ['use-cases', 'core'],
    metadata: {
      description: 'Application business rules - use case interactors',
      layer: 1
    }
  },
  {
    name: 'interface-adapters',
    pattern: 'src/interface-adapters/**',
    mode: 'file',
    tags: ['interface-adapters', 'adapters'],
    metadata: {
      description: 'Interface adapters - controllers, gateways, presenters',
      layer: 2
    }
  },
  {
    name: 'frameworks-drivers',
    pattern: 'src/frameworks-drivers/**',
    mode: 'file',
    tags: ['frameworks-drivers', 'infrastructure'],
    metadata: {
      description: 'Frameworks and drivers - web, database, external interfaces',
      layer: 3 // Outermost layer
    }
  }
]
