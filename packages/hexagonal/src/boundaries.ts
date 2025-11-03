import type { BoundaryDefinition } from '@stricture/core'

/**
 * Hexagonal architecture boundary definitions
 *
 * Defines the four key layers:
 * - domain: Pure business logic (innermost)
 * - ports: Interface definitions
 * - application: Use cases and orchestration
 * - adapters: Infrastructure implementations (outermost)
 */
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'domain',
    pattern: 'src/core/domain/**',
    mode: 'file',
    tags: ['core', 'domain'],
    metadata: {
      description: 'Pure business logic - entities, value objects, domain services',
      layer: 0,  // Innermost layer
      allowedDependencies: []
    }
  },
  {
    name: 'ports',
    pattern: 'src/core/ports/**',
    mode: 'file',
    tags: ['core', 'ports'],
    metadata: {
      description: 'Interface definitions for external interactions',
      layer: 1,
      allowedDependencies: ['domain']
    }
  },
  {
    name: 'application',
    pattern: 'src/core/application/**',
    mode: 'file',
    tags: ['core', 'application'],
    metadata: {
      description: 'Use cases that orchestrate domain and ports',
      layer: 2,
      allowedDependencies: ['domain', 'ports']
    }
  },
  {
    name: 'adapters',
    pattern: 'src/adapters/**',
    mode: 'file',
    tags: ['adapters'],
    metadata: {
      description: 'Infrastructure implementations of ports',
      layer: 3,  // Outermost layer
      allowedDependencies: ['ports', 'application']
    }
  }
]
