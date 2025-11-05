#!/usr/bin/env node
import { MemoryUserRepository } from './src/adapters/driven/memory-repository.js'
import { CreateUserUseCase } from './src/core/application/create-user.js'
import { ListUsersUseCase } from './src/core/application/list-users.js'
import { CliAdapter } from './src/adapters/driving/cli.js'

/**
 * Composition Root - Dependency Injection Container
 *
 * This is the ONLY place that knows about concrete implementations.
 * It wires all dependencies together and creates the application graph.
 *
 * Dependency flow (from outside-in):
 * 1. Driven adapters (infrastructure) - implements ports
 * 2. Use cases - orchestrate domain using port interfaces
 * 3. Driving adapters (entry points) - call use cases
 *
 * Why this pattern:
 * - CLI doesn't know about MemoryRepository (easy to swap)
 * - Use cases don't know about concrete repository (testable)
 * - Only this file knows about all concrete classes
 * - Maintains proper dependency inversion
 */

// 1. Create driven adapters (infrastructure)
const userRepository = new MemoryUserRepository()

// 2. Create use cases with their dependencies
const createUserUseCase = new CreateUserUseCase(userRepository)
const listUsersUseCase = new ListUsersUseCase(userRepository)

// 3. Create driving adapter (entry point) with use cases
const cli = new CliAdapter(createUserUseCase, listUsersUseCase)

// 4. Run the application
const args = process.argv.slice(2)
cli.run(args).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
