/**
 * Task Gateway Interface (Layer 1 - Use Cases)
 *
 * This is a data access interface defined in the use cases layer.
 * It will be implemented by a gateway in the interface adapters layer.
 *
 * This is an example of the Dependency Inversion Principle:
 * - The use case defines the interface it needs
 * - The outer layer (interface-adapters) provides the implementation
 * - Dependencies point INWARD
 */

import { Task } from '../entities/task.js'

/**
 * Gateway interface for task persistence
 */
export interface TaskGateway {
  /**
   * Save a task
   */
  save(task: Task): Promise<void>

  /**
   * Find a task by ID
   */
  findById(id: string): Promise<Task | null>

  /**
   * Find all tasks
   */
  findAll(): Promise<Task[]>

  /**
   * Delete a task
   */
  delete(id: string): Promise<void>
}
