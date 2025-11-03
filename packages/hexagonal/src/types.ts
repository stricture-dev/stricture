/**
 * Hexagonal architecture type augmentations
 *
 * These types provide TypeScript support for hexagonal-specific patterns.
 * They are optional helper types that consumers can use.
 */

/**
 * Marker type for hexagonal architecture boundaries
 */
export type HexagonalBoundary = 'domain' | 'ports' | 'application' | 'adapters'

/**
 * Port definition type
 * Ports are interfaces that define contracts for external interactions
 */
export interface PortDefinition<T = any> {
  /**
   * The interface name (e.g., 'UserRepository', 'EmailService')
   */
  name: string

  /**
   * Contract methods or properties
   */
  contract: T
}

/**
 * Adapter definition type
 * Adapters are concrete implementations of ports
 */
export interface AdapterDefinition<TPort = any> {
  /**
   * The adapter name (e.g., 'PostgresUserRepository', 'SendGridEmailService')
   */
  name: string

  /**
   * The port this adapter implements
   */
  implements: PortDefinition<TPort>
}

/**
 * Domain entity marker type
 * Entities have identity and lifecycle
 */
export interface DomainEntity<TId = string> {
  /**
   * Unique identifier
   */
  id: TId
}

/**
 * Use case marker type
 * Use cases orchestrate domain and ports to accomplish business goals
 */
export interface UseCase<TInput = any, TOutput = any> {
  /**
   * Execute the use case
   */
  execute(input: TInput): Promise<TOutput> | TOutput
}
