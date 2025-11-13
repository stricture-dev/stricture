/**
 * Application Layer - List Tasks Use Case
 * 
 * Retrieves all tasks from the repository.
 */

import { Task } from '../domain/task.js'
import { TaskRepository } from '../infrastructure/task-repository.js'

export class ListTasksUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepo.findAll()
  }
}
