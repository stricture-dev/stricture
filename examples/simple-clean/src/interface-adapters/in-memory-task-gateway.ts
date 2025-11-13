/**
 * In-Memory Task Gateway (Layer 2 - Interface Adapters)
 *
 * This gateway implements the TaskGateway interface defined in the use-cases layer.
 * It provides an in-memory implementation for storing tasks.
 *
 * Note: This adapter can import entities because it needs to work with them.
 * It implements an interface defined in the use-cases layer.
 */

import { Task } from '../entities/task.js'
import { TaskGateway } from '../use-cases/task-gateway.js'

/**
 * In-memory implementation of TaskGateway
 */
export class InMemoryTaskGateway implements TaskGateway {
  private tasks: Map<string, Task> = new Map()

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task)
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values())
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id)
  }
}
