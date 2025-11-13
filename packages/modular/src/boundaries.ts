import type { BoundaryDefinition } from '@stricture/core'

export const boundaries: BoundaryDefinition[] = [
  {
    name: 'module-public',
    pattern: 'src/features/*/index.ts',
    mode: 'file',
    tags: ['module-public', 'features'],
    metadata: {
      description: 'Public API exports for feature modules',
      visibility: 'public'
    }
  },
  {
    name: 'module-internal',
    pattern: 'src/features/**',
    mode: 'file',
    tags: ['module-internal', 'features'],
    metadata: {
      description: 'Internal implementation files within feature modules',
      visibility: 'private'
    }
  },
  {
    name: 'shared',
    pattern: 'src/shared/**',
    mode: 'file',
    tags: ['shared', 'common'],
    metadata: {
      description: 'Shared utilities, components, and types',
      visibility: 'public'
    }
  }
]
