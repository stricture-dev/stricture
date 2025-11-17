import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { TasksRepository } from './tasks.repository'
import { Task } from './entities/task.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskDto } from './dto/task.dto'
import { TaskStatus } from '../common/types'

/**
 * Service for task business logic
 *
 * Responsibilities:
 * - Implement business rules and validation
 * - Orchestrate use cases
 * - Map between DTOs and Entities
 * - Coordinate with repositories
 *
 * Business rules enforced:
 * - Task titles must not be empty
 * - Cannot complete already completed tasks
 * - Tasks must exist before updating/deleting
 */
@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    // Business rule: Title cannot be empty
    if (!createTaskDto.title.trim()) {
      throw new BadRequestException('Title cannot be empty')
    }

    // Create entity from DTO
    const task = new Task(
      this.generateId(),
      createTaskDto.title,
      createTaskDto.description || '',
      TaskStatus.TODO,
      createTaskDto.priority,
      new Date(),
      new Date(),
    )

    // Persist
    await this.tasksRepository.save(task)

    // Return DTO
    return this.entityToDto(task)
  }

  /**
   * Find all tasks
   */
  async findAll(): Promise<TaskDto[]> {
    const tasks = await this.tasksRepository.findAll()
    return tasks.map((task) => this.entityToDto(task))
  }

  /**
   * Find task by ID
   */
  async findOne(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    return this.entityToDto(task)
  }

  /**
   * Update a task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    // Business rule: Title cannot be empty if provided
    if (updateTaskDto.title !== undefined && !updateTaskDto.title.trim()) {
      throw new BadRequestException('Title cannot be empty')
    }

    // Update entity
    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description
    }
    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority
    }
    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status
    }

    task.updatedAt = new Date()

    // Persist changes
    await this.tasksRepository.update(task)

    return this.entityToDto(task)
  }

  /**
   * Delete a task
   */
  async remove(id: string): Promise<void> {
    const exists = await this.tasksRepository.exists(id)

    if (!exists) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    await this.tasksRepository.delete(id)
  }

  /**
   * Mark a task as complete
   */
  async complete(id: string): Promise<TaskDto> {
    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }

    // Business rule: Cannot complete already completed task
    if (task.status === TaskStatus.DONE) {
      throw new BadRequestException('Task is already completed')
    }

    // Update status
    task.status = TaskStatus.DONE
    task.updatedAt = new Date()

    // Persist changes
    await this.tasksRepository.update(task)

    return this.entityToDto(task)
  }

  /**
   * Map entity to DTO
   *
   * This is where we transform internal representation to API representation.
   * Dates become ISO strings, enums become strings, etc.
   */
  private entityToDto(task: Task): TaskDto {
    return new TaskDto(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.createdAt.toISOString(),
      task.updatedAt.toISOString(),
    )
  }

  /**
   * Generate unique task ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
