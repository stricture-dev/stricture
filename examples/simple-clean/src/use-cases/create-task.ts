/**
 * Create Task Use Case (Layer 1 - Use Cases)
 *
 * Application business rule for creating a new task.
 * This use case orchestrates the domain entities and external interfaces.
 */

import { Task, TaskStatus, TaskPriority } from '../entities/task.js'
import { TaskGateway } from './task-gateway.js'
import { TaskOutputPort } from './output-port.js'

/**
 * Input data for creating a task
 */
export interface CreateTaskInput {
  title: string
  description: string
  priority: TaskPriority
}

/**
 * Create Task Use Case Interactor
 */
export class CreateTaskUseCase {
  constructor(
    private readonly taskGateway: TaskGateway,
    private readonly outputPort: TaskOutputPort
  ) {}

  async execute(input: CreateTaskInput): Promise<void> {
    try {
      // Generate unique ID
      const id = this.generateId()

      // Create domain entity (validation happens in constructor)
      const task = new Task(
        id,
        input.title,
        input.description,
        TaskStatus.TODO,
        input.priority,
        new Date(),
        null
      )

      // Save through gateway (interface defined in use-cases, implemented in adapters)
      await this.taskGateway.save(task)

      // Present success through output port
      this.outputPort.presentSuccess(`Task "${task.title}" created successfully`)
      this.outputPort.presentTask(task)
    } catch (error) {
      // Present error through output port
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.outputPort.presentError(`Failed to create task: ${message}`)
    }
  }

  private generateId(): string {
    return `task_${Math.random().toString(36).substr(2, 9)}`
  }
}
