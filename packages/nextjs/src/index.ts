import type { ArchPreset } from '@stricture/core'
import { boundaries } from './boundaries.js'
import { rules } from './rules.js'
import { diagram } from './diagram.js'
import { scaffolding } from './scaffolding.js'

/**
 * Next.js Architecture (App Router) preset for Stricture
 *
 * Enforces clean separation between Server Components, Client Components,
 * API routes, and server-only utilities in Next.js 13+ applications.
 *
 * @example
 * ```typescript
 * import { nextjsPreset } from '@stricture/nextjs'
 *
 * export default {
 *   preset: nextjsPreset,
 *   // Additional customization...
 * }
 * ```
 */
export const nextjsPreset: ArchPreset = {
  id: '@stricture/nextjs',
  name: 'Next.js Architecture',
  description: 'Next.js App Router with Server/Client boundaries',
  boundaries,
  rules,
  diagram,
  scaffolding
}

// Default export for convenience
export default nextjsPreset

// Re-export components for advanced usage
export { boundaries } from './boundaries.js'
export { rules } from './rules.js'
export { diagram } from './diagram.js'
export { scaffolding } from './scaffolding.js'

// Re-export types
export type {
  Runtime,
  ComponentType,
  ServerComponent,
  ClientComponent,
  ServerAction,
  APIRouteHandler
} from './types.js'
