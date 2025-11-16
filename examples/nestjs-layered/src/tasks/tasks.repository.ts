import { Injectable } from '@nestjs/common'
import { Task } from './entities/task.entity'

/**
 * Repository for task data access
 *
 * Responsibilities:
 * - Encapsulate data persistence
 * - Work with Task entities only
 * - Provide CRUD operations
 *
 * This example uses in-memory storage, but in production this would
 * interface with TypeORM, Prisma, or another database solution.
 */
@Injectable()
export class TasksRepository {
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

  async update(task: Task): Promise<void> {
    if (!this.tasks.has(task.id)) {
      throw new Error(`Task ${task.id} not found`)
    }
    this.tasks.set(task.id, task)
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id)
  }

  async exists(id: string): Promise<boolean> {
    return this.tasks.has(id)
  }
}
