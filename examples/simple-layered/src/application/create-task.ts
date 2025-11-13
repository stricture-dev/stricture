/**
 * Application Layer - Create Task Use Case
 * 
 * Orchestrates domain logic and infrastructure to create a task.
 * Application layer coordinates between domain and infrastructure.
 */

import { Task, TaskStatus, Priority } from '../domain/task.js'
import { TaskRepository } from '../infrastructure/task-repository.js'

export interface CreateTaskInput {
  title: string
  description: string
  priority: Priority
}

export class CreateTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    const task = new Task(
      id,
      input.title,
      input.description,
      TaskStatus.TODO,
      input.priority,
      new Date()
    )

    if (!task.isValid()) {
      throw new Error('Invalid task: title is required')
    }

    await this.taskRepo.save(task)

    return task
  }
}
