/**
 * Task service (private to this module)
 */

import type { Task, CreateTaskInput } from './types.js'
// ✅ Import from user module's public API
import type { User } from '../user/index.js'

// In-memory storage for demo
const tasks: Map<string, Task> = new Map()

export class TaskService {
  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: input.title,
      description: input.description,
      completed: false,
      assigneeId: input.assigneeId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    tasks.set(task.id, task)
    return task
  }

  findById(id: string): Task | undefined {
    return tasks.get(id)
  }

  findAll(): Task[] {
    return Array.from(tasks.values())
  }

  complete(id: string): Task | undefined {
    const task = tasks.get(id)
    if (!task) return undefined

    const completed: Task = {
      ...task,
      completed: true,
      updatedAt: new Date()
    }
    tasks.set(id, completed)
    return completed
  }

  assignToUser(taskId: string, userId: string): Task | undefined {
    const task = tasks.get(taskId)
    if (!task) return undefined

    const assigned: Task = {
      ...task,
      assigneeId: userId,
      updatedAt: new Date()
    }
    tasks.set(taskId, assigned)
    return assigned
  }
}
