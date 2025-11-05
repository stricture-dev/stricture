import type { BoundaryDefinition } from '@stricture/core'

/**
 * Hexagonal architecture boundary definitions
 *
 * Defines the five key layers:
 * - domain: Pure business logic (innermost)
 * - ports: Interface definitions
 * - application: Use cases and orchestration
 * - driving-adapters: Primary/Active adapters (entry points)
 * - driven-adapters: Secondary/Passive adapters (implementations)
 */
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'domain',
    pattern: 'src/core/domain/**',
    mode: 'file',
    tags: ['core', 'domain'],
    metadata: {
      description: 'Pure business logic - entities, value objects, domain services',
      layer: 0  // Innermost layer
    }
  },
  {
    name: 'ports',
    pattern: 'src/core/ports/**',
    mode: 'file',
    tags: ['core', 'ports'],
    metadata: {
      description: 'Interface definitions for external interactions',
      layer: 1
    }
  },
  {
    name: 'application',
    pattern: 'src/core/application/**',
    mode: 'file',
    tags: ['core', 'application'],
    metadata: {
      description: 'Use cases that orchestrate domain and ports',
      layer: 2
    }
  },
  {
    name: 'driving-adapters',
    pattern: 'src/adapters/driving/**',
    mode: 'file',
    tags: ['adapters', 'driving'],
    metadata: {
      description: 'Primary adapters - entry points that call the application (CLI, HTTP, etc.)',
      layer: 3
    }
  },
  {
    name: 'driven-adapters',
    pattern: 'src/adapters/driven/**',
    mode: 'file',
    tags: ['adapters', 'driven'],
    metadata: {
      description: 'Secondary adapters - implementations of ports called by application (Repositories, APIs)',
      layer: 3
    }
  }
]
