import { Module } from '@nestjs/common'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { TasksRepository } from './tasks.repository'

/**
 * Tasks module - Dependency injection configuration
 *
 * This module wires together:
 * - Controller (HTTP layer)
 * - Service (business logic)
 * - Repository (data access)
 *
 * The module can import from any layer for wiring purposes.
 * This is the composition root for the tasks feature.
 */
@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService], // Export service for use in other modules
})
export class TasksModule {}
