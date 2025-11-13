/**
 * Output Port Interface (Layer 1 - Use Cases)
 *
 * Output ports define how use cases communicate results to the outside world.
 * Presenters in the interface-adapters layer will implement these interfaces.
 *
 * This separates business logic from presentation logic.
 */

import { Task } from '../entities/task.js'

/**
 * Output port for presenting task results
 */
export interface TaskOutputPort {
  /**
   * Present a single task
   */
  presentTask(task: Task): void

  /**
   * Present multiple tasks
   */
  presentTaskList(tasks: Task[]): void

  /**
   * Present an error
   */
  presentError(message: string): void

  /**
   * Present a success message
   */
  presentSuccess(message: string): void
}
