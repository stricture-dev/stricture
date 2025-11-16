import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskDto } from './dto/task.dto'

/**
 * Controller for task HTTP endpoints
 *
 * Responsibilities:
 * - Handle HTTP requests and responses
 * - Validate input using DTOs
 * - Delegate business logic to service
 * - Return DTOs (not entities!)
 *
 * Note: This controller uses DTOs exclusively for API contracts.
 * It never directly imports or exposes entity classes, ensuring
 * API and database models can evolve independently.
 */
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   * POST /tasks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskDto> {
    return this.tasksService.create(createTaskDto)
  }

  /**
   * Get all tasks
   * GET /tasks
   */
  @Get()
  async findAll(): Promise<TaskDto[]> {
    return this.tasksService.findAll()
  }

  /**
   * Get task by ID
   * GET /tasks/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TaskDto> {
    return this.tasksService.findOne(id)
  }

  /**
   * Update a task
   * PUT /tasks/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.update(id, updateTaskDto)
  }

  /**
   * Delete a task
   * DELETE /tasks/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id)
  }

  /**
   * Mark task as complete
   * PATCH /tasks/:id/complete
   */
  @Patch(':id/complete')
  async complete(@Param('id') id: string): Promise<TaskDto> {
    return this.tasksService.complete(id)
  }
}
