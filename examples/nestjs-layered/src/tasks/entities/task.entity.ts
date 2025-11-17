import { TaskStatus, Priority } from '../../common/types'

/**
 * Task entity - Domain model for tasks
 *
 * This represents the internal data structure.
 * DTOs are used for API contracts, keeping them separate allows
 * the database model to evolve independently of the API.
 */
export class Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: Date
  updatedAt: Date

  constructor(
    id: string,
    title: string,
    description: string,
    status: TaskStatus,
    priority: Priority,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id
    this.title = title
    this.description = description
    this.status = status
    this.priority = priority
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
