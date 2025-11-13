/**
 * Infrastructure Layer - Task Repository
 * 
 * Provides data persistence. In layered architecture, infrastructure
 * is the bottom layer and handles external systems.
 * 
 * NOTE: In this example, we're using in-memory storage for simplicity.
 * In a real app, this would connect to a database.
 */

import { Task } from '../domain/task.js'

export class TaskRepository {
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

  async exists(id: string): Promise<boolean> {
    return this.tasks.has(id)
  }
}
