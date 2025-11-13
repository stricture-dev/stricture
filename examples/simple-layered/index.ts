#!/usr/bin/env node
/**
 * Composition Root - Main Entry Point
 * 
 * This is where we wire all dependencies together.
 * In layered architecture, the composition root creates instances
 * starting from the bottom layer (infrastructure) up to the top (presentation).
 */

import { TaskRepository } from './src/infrastructure/task-repository.js'
import { CreateTaskUseCase } from './src/application/create-task.js'
import { ListTasksUseCase } from './src/application/list-tasks.js'
import { CompleteTaskUseCase } from './src/application/complete-task.js'
import { CLI } from './src/presentation/cli.js'

// 1. Create infrastructure (bottom layer)
const taskRepository = new TaskRepository()

// 2. Create application services (use cases) - inject infrastructure dependencies
const createTaskUseCase = new CreateTaskUseCase(taskRepository)
const listTasksUseCase = new ListTasksUseCase(taskRepository)
const completeTaskUseCase = new CompleteTaskUseCase(taskRepository)

// 3. Create presentation layer - inject application dependencies
const cli = new CLI(
  createTaskUseCase,
  listTasksUseCase,
  completeTaskUseCase
)

// 4. Run!
cli.run(process.argv.slice(2))
