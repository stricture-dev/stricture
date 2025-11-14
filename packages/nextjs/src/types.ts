/**
 * Next.js architecture type augmentations
 *
 * These types provide TypeScript support for Next.js-specific patterns.
 * They are optional helper types that consumers can use.
 */

/**
 * Marker type for Next.js runtime environment
 */
export type Runtime = 'server' | 'client' | 'edge' | 'universal'

/**
 * Marker type for Next.js component types
 */
export type ComponentType = 'server' | 'client'

/**
 * Server Component marker interface
 * Server Components can be async and return React elements
 */
export interface ServerComponent<TProps = unknown> {
  (props: TProps): Promise<unknown> | unknown
}

/**
 * Client Component marker interface
 * Client Components cannot be async
 */
export interface ClientComponent<TProps = unknown> {
  (props: TProps): unknown
}

/**
 * Server Action marker interface
 */
export interface ServerAction<TInput = unknown, TOutput = unknown> {
  /**
   * Server Actions are always async
   */
  (input: TInput): Promise<TOutput>
}

/**
 * API Route Handler marker interface
 * Generic HTTP method handlers
 */
export interface APIRouteHandler {
  GET?: (request: unknown) => Promise<unknown> | unknown
  POST?: (request: unknown) => Promise<unknown> | unknown
  PUT?: (request: unknown) => Promise<unknown> | unknown
  DELETE?: (request: unknown) => Promise<unknown> | unknown
  PATCH?: (request: unknown) => Promise<unknown> | unknown
}
