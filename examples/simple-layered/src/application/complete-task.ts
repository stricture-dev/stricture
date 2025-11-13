/**
 * Application Layer - Complete Task Use Case
 * 
 * Marks a task as completed by calling domain logic.
 */

import { Task } from '../domain/task.js'
import { TaskRepository } from '../infrastructure/task-repository.js'

export class CompleteTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findById(taskId)
    
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`)
    }

    // Call domain business logic
    const completedTask = task.complete()

    // Persist changes
    await this.taskRepo.save(completedTask)

    return completedTask
  }
}
