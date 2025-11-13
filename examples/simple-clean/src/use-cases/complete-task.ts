/**
 * Complete Task Use Case (Layer 1 - Use Cases)
 *
 * Application business rule for completing a task.
 */

import { TaskGateway } from './task-gateway.js'
import { TaskOutputPort } from './output-port.js'

/**
 * Complete Task Use Case Interactor
 */
export class CompleteTaskUseCase {
  constructor(
    private readonly taskGateway: TaskGateway,
    private readonly outputPort: TaskOutputPort
  ) {}

  async execute(taskId: string): Promise<void> {
    try {
      // Find task through gateway
      const task = await this.taskGateway.findById(taskId)

      if (!task) {
        this.outputPort.presentError(`Task with ID "${taskId}" not found`)
        return
      }

      // Business logic: complete the task (validation in entity)
      const completedTask = task.complete()

      // Save updated task through gateway
      await this.taskGateway.save(completedTask)

      // Present success through output port
      this.outputPort.presentSuccess(`Task "${completedTask.title}" completed`)
      this.outputPort.presentTask(completedTask)
    } catch (error) {
      // Present error through output port
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.outputPort.presentError(`Failed to complete task: ${message}`)
    }
  }
}
