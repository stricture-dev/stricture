import type { BoundaryDefinition } from '@stricture/core'

/**
 * Next.js architecture boundary definitions
 *
 * Defines the key boundaries for Next.js App Router:
 * - server-components: React Server Components
 * - client-components: Client Components with 'use client'
 * - app-routes: App Router pages and layouts
 * - api-routes: API route handlers
 * - server-utils: Server-only utilities (database, auth, etc.)
 * - shared-utils: Universal utilities
 * - server-actions: Server Actions with 'use server'
 */
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'server-components',
    pattern: 'components/server/**',
    mode: 'file',
    tags: ['components', 'server'],
    metadata: {
      description: 'React Server Components - can use server-only code',
      runtime: 'server'
    }
  },
  {
    name: 'client-components',
    pattern: 'components/client/**',
    mode: 'file',
    tags: ['components', 'client'],
    metadata: {
      description: 'Client Components with "use client" directive',
      runtime: 'client'
    }
  },
  {
    name: 'app-routes',
    pattern: 'app/**',
    mode: 'file',
    tags: ['app', 'routes'],
    metadata: {
      description: 'App Router pages and layouts (Server Components by default)',
      runtime: 'server'
    }
  },
  {
    name: 'api-routes',
    pattern: 'app/api/**',
    mode: 'file',
    tags: ['api', 'server'],
    metadata: {
      description: 'API route handlers',
      runtime: 'server'
    }
  },
  {
    name: 'server-utils',
    pattern: 'lib/server/**',
    mode: 'file',
    tags: ['lib', 'server', 'server-utils'],
    metadata: {
      description: 'Server-only utilities (database, auth, etc.)',
      runtime: 'server'
    }
  },
  {
    name: 'shared-utils',
    pattern: 'lib/!(server)/**',
    mode: 'file',
    tags: ['lib', 'shared'],
    metadata: {
      description: 'Utilities that work on both server and client',
      runtime: 'universal'
    }
  },
  {
    name: 'server-actions',
    pattern: 'actions/**',
    mode: 'file',
    tags: ['actions', 'server'],
    metadata: {
      description: 'Server Actions with "use server" directive',
      runtime: 'server'
    }
  }
]
