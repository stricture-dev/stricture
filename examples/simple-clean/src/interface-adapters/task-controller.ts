/**
 * Task Controller (Layer 2 - Interface Adapters)
 *
 * Controllers receive input from the external world and invoke use cases.
 * They convert external data formats into use case input structures.
 *
 * This controller handles CLI-style commands, but in a real application,
 * this could be an HTTP controller, GraphQL resolver, etc.
 */

import { TaskPriority } from '../entities/task.js'
import { CreateTaskUseCase, CreateTaskInput } from '../use-cases/create-task.js'
import { ListTasksUseCase } from '../use-cases/list-tasks.js'
import { CompleteTaskUseCase } from '../use-cases/complete-task.js'

/**
 * Controller for task operations
 */
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly completeTaskUseCase: CompleteTaskUseCase
  ) {}

  /**
   * Handle create task command
   */
  async handleCreateTask(
    title: string,
    description: string,
    priority: string
  ): Promise<void> {
    // Convert external format to use case input
    const taskPriority = this.parseTaskPriority(priority)

    const input: CreateTaskInput = {
      title,
      description,
      priority: taskPriority
    }

    // Invoke use case
    await this.createTaskUseCase.execute(input)
  }

  /**
   * Handle list tasks command
   */
  async handleListTasks(): Promise<void> {
    // Invoke use case (no input needed)
    await this.listTasksUseCase.execute()
  }

  /**
   * Handle complete task command
   */
  async handleCompleteTask(taskId: string): Promise<void> {
    // Invoke use case
    await this.completeTaskUseCase.execute(taskId)
  }

  /**
   * Parse task priority from string
   */
  private parseTaskPriority(priority: string): TaskPriority {
    const normalized = priority.toUpperCase()

    switch (normalized) {
      case 'LOW':
        return TaskPriority.LOW
      case 'MEDIUM':
        return TaskPriority.MEDIUM
      case 'HIGH':
        return TaskPriority.HIGH
      default:
        return TaskPriority.MEDIUM
    }
  }
}
