/**
 * Clean Architecture type augmentations
 *
 * These types provide TypeScript support for Clean Architecture patterns.
 * They are optional helper types that consumers can use.
 */

/**
 * Marker type for Clean Architecture layers
 */
export type CleanArchitectureLayer =
  | 'entities'
  | 'use-cases'
  | 'interface-adapters'
  | 'frameworks-drivers'

/**
 * Entity marker interface
 * Entities have identity and encapsulate enterprise business rules
 */
export interface Entity<TId = string> {
  /**
   * Unique identifier
   */
  readonly id: TId
}

/**
 * Value Object marker interface
 * Value objects are immutable and defined by their attributes
 */
export interface ValueObject {
  /**
   * Check equality with another value object
   */
  equals(other: this): boolean
}

/**
 * Use Case interface
 * Use cases orchestrate the flow of data to and from entities
 */
export interface UseCase<TInput = unknown, TOutput = unknown> {
  /**
   * Execute the use case
   */
  execute(input: TInput): Promise<TOutput> | TOutput
}

/**
 * Input Port interface
 * Input ports define the contract for invoking a use case
 */
export type InputPort<TInput = unknown> = TInput

/**
 * Output Port interface
 * Output ports define how use cases communicate results
 */
export interface OutputPort<TData = unknown> {
  /**
   * Present the output data
   */
  present(data: TData): void | Promise<void>
}

/**
 * Gateway interface
 * Gateways define data access interfaces that adapters implement
 */
export interface Gateway<TEntity = unknown> {
  /**
   * Find an entity by its identifier
   */
  findById?(id: string): Promise<TEntity | null>

  /**
   * Save an entity
   */
  save?(entity: TEntity): Promise<void>

  /**
   * Delete an entity
   */
  delete?(id: string): Promise<void>

  /**
   * Find all entities
   */
  findAll?(): Promise<TEntity[]>
}

/**
 * Controller interface
 * Controllers receive external input and invoke use cases
 */
export interface Controller<TRequest = unknown, TResponse = unknown> {
  /**
   * Handle the incoming request
   */
  handle(request: TRequest): Promise<TResponse> | TResponse
}

/**
 * Presenter interface
 * Presenters format use case output for external consumption
 */
export interface Presenter<TInput = unknown, TOutput = unknown> {
  /**
   * Present the data in the appropriate format
   */
  present(data: TInput): TOutput | Promise<TOutput>
}

/**
 * Request Model type
 * Data structure for external input
 */
export type RequestModel<T = unknown> = T

/**
 * Response Model type
 * Data structure for external output
 */
export type ResponseModel<T = unknown> = T

/**
 * View Model type
 * Data structure prepared for presentation
 */
export type ViewModel<T = unknown> = T
