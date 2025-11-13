/**
 * Type helpers for Layered Architecture
 */

/**
 * Layer types in the architecture
 */
export type Layer = 'presentation' | 'application' | 'domain' | 'infrastructure'

/**
 * Base entity interface with identity
 */
export interface Entity<TId = string> {
  readonly id: TId
}

/**
 * Service interface for application layer services
 */
export interface Service {
  // Marker interface for application services
}

/**
 * Use case interface with execute method
 */
export interface UseCase<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<TOutput> | TOutput
}

/**
 * Repository interface for data access
 */
export interface Repository<TEntity extends Entity, TId = string> {
  findById(id: TId): Promise<TEntity | null>
  save(entity: TEntity): Promise<void>
  delete(id: TId): Promise<void>
}

/**
 * Value object base interface (no identity)
 */
export interface ValueObject {
  equals(other: this): boolean
}

/**
 * Domain service marker interface
 */
export interface DomainService {
  // Marker interface for domain services
}

/**
 * Controller marker interface for presentation layer
 */
export interface Controller {
  // Marker interface for controllers
}

/**
 * DTO (Data Transfer Object) for crossing layer boundaries
 */
export type DTO<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends object
    ? DTO<T[K]>
    : T[K]
}
