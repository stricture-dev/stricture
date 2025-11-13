#!/usr/bin/env node

/**
 * Main Entry Point / Composition Root (Layer 3 - Frameworks & Drivers)
 *
 * This is where all dependency wiring happens.
 * This file knows about ALL layers and wires them together.
 *
 * The Dependency Rule is maintained:
 * - Entities don't know about anything
 * - Use cases know about entities
 * - Interface adapters know about use cases and entities
 * - Frameworks know about everything (this file)
 *
 * All dependencies flow INWARD toward entities.
 */

// Import from outermost to innermost layers
import { CLI } from './src/frameworks-drivers/cli.js'
import { TaskController } from './src/interface-adapters/task-controller.js'
import { InMemoryTaskGateway } from './src/interface-adapters/in-memory-task-gateway.js'
import { ConsoleTaskPresenter } from './src/interface-adapters/console-task-presenter.js'
import { CreateTaskUseCase } from './src/use-cases/create-task.js'
import { ListTasksUseCase } from './src/use-cases/list-tasks.js'
import { CompleteTaskUseCase } from './src/use-cases/complete-task.js'

// ===== COMPOSITION ROOT =====
// This is the ONLY place where concrete classes are wired together

// 1. Create infrastructure (gateways and presenters)
const taskGateway = new InMemoryTaskGateway()
const taskPresenter = new ConsoleTaskPresenter()

// 2. Create use cases (inject dependencies)
const createTaskUseCase = new CreateTaskUseCase(taskGateway, taskPresenter)
const listTasksUseCase = new ListTasksUseCase(taskGateway, taskPresenter)
const completeTaskUseCase = new CompleteTaskUseCase(taskGateway, taskPresenter)

// 3. Create controller (inject use cases)
const taskController = new TaskController(
  createTaskUseCase,
  listTasksUseCase,
  completeTaskUseCase
)

// 4. Create CLI (inject controller)
const cli = new CLI(taskController)

// 5. Run the application
cli.run(process.argv.slice(2))
