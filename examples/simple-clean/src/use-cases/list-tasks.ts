/**
 * List Tasks Use Case (Layer 1 - Use Cases)
 *
 * Application business rule for listing all tasks.
 */

import { TaskGateway } from './task-gateway.js'
import { TaskOutputPort } from './output-port.js'

/**
 * List Tasks Use Case Interactor
 */
export class ListTasksUseCase {
  constructor(
    private readonly taskGateway: TaskGateway,
    private readonly outputPort: TaskOutputPort
  ) {}

  async execute(): Promise<void> {
    try {
      // Retrieve tasks through gateway
      const tasks = await this.taskGateway.findAll()

      // Present results through output port
      this.outputPort.presentTaskList(tasks)
    } catch (error) {
      // Present error through output port
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.outputPort.presentError(`Failed to list tasks: ${message}`)
    }
  }
}
