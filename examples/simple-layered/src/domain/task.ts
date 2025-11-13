/**
 * Domain Layer - Task Entity
 * 
 * Pure business logic with no external dependencies.
 * In layered architecture, domain is independent of application and presentation.
 */

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export class Task {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: TaskStatus,
    public readonly priority: Priority,
    public readonly createdAt: Date,
    public readonly completedAt?: Date
  ) {}

  /**
   * Business rule: Can only complete a task that's not already done
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
   * Business rule: Can only start a task that's in TODO status
   */
  start(): Task {
    if (this.status !== TaskStatus.TODO) {
      throw new Error('Can only start tasks in TODO status')
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.IN_PROGRESS,
      this.priority,
      this.createdAt,
      this.completedAt
    )
  }

  /**
   * Business rule: Task is valid if it has a title
   */
  isValid(): boolean {
    return this.title.length > 0
  }
}
