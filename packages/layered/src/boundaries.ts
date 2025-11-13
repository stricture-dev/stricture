import type { BoundaryDefinition } from '@stricture/core'

export const boundaries: BoundaryDefinition[] = [
  {
    name: 'presentation',
    pattern: 'src/presentation/**',
    mode: 'file',
    tags: ['presentation', 'ui'],
    metadata: {
      description: 'User interface, controllers, views, CLI',
      layer: 0
    }
  },
  {
    name: 'application',
    pattern: 'src/application/**',
    mode: 'file',
    tags: ['application', 'services'],
    metadata: {
      description: 'Use cases, application services, orchestration',
      layer: 1
    }
  },
  {
    name: 'domain',
    pattern: 'src/domain/**',
    mode: 'file',
    tags: ['domain', 'core'],
    metadata: {
      description: 'Business logic, entities, domain services',
      layer: 2
    }
  },
  {
    name: 'infrastructure',
    pattern: 'src/infrastructure/**',
    mode: 'file',
    tags: ['infrastructure', 'data'],
    metadata: {
      description: 'Data access, external systems, persistence',
      layer: 3
    }
  }
]
