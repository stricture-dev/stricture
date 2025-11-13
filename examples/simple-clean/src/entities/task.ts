/**
 * Task Entity (Layer 0 - Entities)
 *
 * Enterprise business rules for a task.
 * This entity encapsulates the core business logic for tasks.
 *
 * IMPORTANT: Entities have ZERO dependencies on outer layers.
 * They cannot import from use-cases, interface-adapters, or frameworks-drivers.
 */

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Task entity with business rules
 */
export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: TaskStatus,
    public readonly priority: TaskPriority,
    public readonly createdAt: Date,
    public readonly completedAt: Date | null = null
  ) {
    this.validate()
  }

  /**
   * Business rule: Validate task data
   */
  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Task title cannot be empty')
    }

    if (this.title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters')
    }

    if (this.description.length > 2000) {
      throw new Error('Task description cannot exceed 2000 characters')
    }

    // Business rule: Completed tasks must have completedAt
    if (this.status === TaskStatus.DONE && !this.completedAt) {
      throw new Error('Completed tasks must have a completion date')
    }

    // Business rule: Non-completed tasks should not have completedAt
    if (this.status !== TaskStatus.DONE && this.completedAt) {
      throw new Error('Only completed tasks can have a completion date')
    }
  }

  /**
   * Business rule: Mark task as in progress
   */
  markInProgress(): Task {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Cannot start a completed task')
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.IN_PROGRESS,
      this.priority,
      this.createdAt,
      null
    )
  }

  /**
   * Business rule: Mark task as complete
   */
  complete(): Task {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Task is already completed')
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.DONE,
      this.priority,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Business rule: Reopen a completed task
   */
  reopen(): Task {
    if (this.status !== TaskStatus.DONE) {
      throw new Error('Only completed tasks can be reopened')
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.TODO,
      this.priority,
      this.createdAt,
      null
    )
  }

  /**
   * Business rule: Update priority
   */
  updatePriority(newPriority: TaskPriority): Task {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Cannot update priority of completed task')
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      newPriority,
      this.createdAt,
      this.completedAt
    )
  }

  /**
   * Display title with status indicator
   */
  getDisplayTitle(): string {
    const statusIcon = {
      [TaskStatus.TODO]: '⬜',
      [TaskStatus.IN_PROGRESS]: '🔄',
      [TaskStatus.DONE]: '✅'
    }[this.status]

    const priorityIcon = {
      [TaskPriority.LOW]: '🔵',
      [TaskPriority.MEDIUM]: '🟡',
      [TaskPriority.HIGH]: '🔴'
    }[this.priority]

    return `${statusIcon} ${priorityIcon} ${this.title}`
  }

  /**
   * Check if task is overdue (for demonstration purposes)
   */
  isOverdue(daysOld: number = 30): boolean {
    if (this.status === TaskStatus.DONE) {
      return false
    }

    const ageInDays =
      (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return ageInDays > daysOld
  }
}
