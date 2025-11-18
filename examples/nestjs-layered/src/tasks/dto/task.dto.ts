/**
 * DTO for task responses
 *
 * This defines the structure of tasks returned by the API.
 * Note: Date fields are ISO strings in the API, while the entity uses Date objects.
 * This allows for proper JSON serialization and API versioning.
 */
export class TaskDto {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string

  constructor(
    id: string,
    title: string,
    description: string,
    status: string,
    priority: string,
    createdAt: string,
    updatedAt: string,
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
