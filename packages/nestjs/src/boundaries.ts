import type { BoundaryDefinition } from '@stricture/core'

/**
 * NestJS architecture boundary definitions
 *
 * Defines boundaries for NestJS-specific architectural layers:
 * - controllers: HTTP request handlers (*.controller.ts)
 * - services: Business logic providers (*.service.ts)
 * - dtos: Data Transfer Objects for API contracts (dto/**)
 * - entities: Database entities and domain models (entities/**)
 * - repositories: Data access layer (*.repository.ts)
 * - guards: Authorization and authentication (guards/**)
 * - interceptors: Request/response transformation (interceptors/**)
 * - pipes: Validation and transformation (pipes/**)
 * - decorators: Custom decorators (decorators/**)
 * - common: Shared utilities and helpers (common/**)
 * - config: Configuration modules (config/**)
 */
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'controllers',
    pattern: 'src/**/*.controller.ts',
    mode: 'file',
    tags: ['nestjs', 'controllers', 'presentation'],
    metadata: {
      description: 'HTTP controllers handling requests and responses',
      layer: 0  // Outermost layer (entry points)
    }
  },
  {
    name: 'services',
    pattern: 'src/**/*.service.ts',
    mode: 'file',
    tags: ['nestjs', 'services', 'business-logic'],
    metadata: {
      description: 'Business logic providers injected via DI',
      layer: 1
    }
  },
  {
    name: 'dtos',
    pattern: 'src/**/dto/**',
    mode: 'file',
    tags: ['nestjs', 'dtos', 'contracts'],
    metadata: {
      description: 'Data Transfer Objects for API contracts',
      layer: 0  // Part of presentation layer
    }
  },
  {
    name: 'entities',
    pattern: 'src/**/entities/**',
    mode: 'file',
    tags: ['nestjs', 'entities', 'data'],
    metadata: {
      description: 'Database entities and domain models',
      layer: 2  // Innermost layer
    }
  },
  {
    name: 'repositories',
    pattern: 'src/**/*.repository.ts',
    mode: 'file',
    tags: ['nestjs', 'repositories', 'data'],
    metadata: {
      description: 'Data access layer (TypeORM repositories, Prisma clients, etc.)',
      layer: 2
    }
  },
  {
    name: 'guards',
    pattern: 'src/**/guards/**',
    mode: 'file',
    tags: ['nestjs', 'guards', 'common'],
    metadata: {
      description: 'Authorization and authentication guards',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'interceptors',
    pattern: 'src/**/interceptors/**',
    mode: 'file',
    tags: ['nestjs', 'interceptors', 'common'],
    metadata: {
      description: 'Request/response transformation interceptors',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'pipes',
    pattern: 'src/**/pipes/**',
    mode: 'file',
    tags: ['nestjs', 'pipes', 'common'],
    metadata: {
      description: 'Validation and transformation pipes',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'decorators',
    pattern: 'src/**/decorators/**',
    mode: 'file',
    tags: ['nestjs', 'decorators', 'common'],
    metadata: {
      description: 'Custom decorators for metadata and behavior',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'common',
    pattern: 'src/common/**',
    mode: 'file',
    tags: ['nestjs', 'common', 'shared'],
    metadata: {
      description: 'Shared utilities, interfaces, and types',
      layer: -1  // Available everywhere
    }
  },
  {
    name: 'config',
    pattern: 'src/config/**',
    mode: 'file',
    tags: ['nestjs', 'config', 'common'],
    metadata: {
      description: 'Configuration modules and services',
      layer: -1  // Cross-cutting concern
    }
  }
]
