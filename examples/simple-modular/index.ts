/**
 * Simple Modular Architecture Example
 *
 * Demonstrates feature-based modular architecture with Stricture boundary enforcement.
 *
 * Key principles:
 * 1. Modules communicate through public APIs (index.ts)
 * 2. Internal files are private to the module
 * 3. Shared utilities are accessible to all modules
 */

// ✅ Import from module public APIs
import { UserService, type User } from './src/features/user/index.js'
import { TaskService, type Task } from './src/features/tasks/index.js'

// ✅ Import from shared utilities
import { formatDateTime } from './src/shared/utils/format.js'

function main() {
  console.log('=== Simple Modular Architecture Example ===\n')

  // Create user service
  const userService = new UserService()

  // Create some users
  const alice = userService.create({ name: 'Alice', email: 'alice@example.com' })
  const bob = userService.create({ name: 'Bob', email: 'bob@example.com' })

  console.log('Created users:')
  console.log(`- ${alice.name} (${alice.email})`)
  console.log(`- ${bob.name} (${bob.email})`)
  console.log()

  // Create task service
  const taskService = new TaskService()

  // Create some tasks
  const task1 = taskService.create({
    title: 'Implement modular preset',
    description: 'Create @stricture/modular package',
    assigneeId: alice.id
  })

  const task2 = taskService.create({
    title: 'Write documentation',
    description: 'Document the modular architecture pattern',
    assigneeId: bob.id
  })

  const task3 = taskService.create({
    title: 'Add tests',
    description: 'Write comprehensive test suite'
  })

  console.log('Created tasks:')
  console.log(`- ${task1.title} (assigned to ${alice.name})`)
  console.log(`- ${task2.title} (assigned to ${bob.name})`)
  console.log(`- ${task3.title} (unassigned)`)
  console.log()

  // Complete a task
  taskService.complete(task1.id)
  console.log(`✓ Completed: ${task1.title}`)
  console.log()

  // List all tasks
  console.log('All tasks:')
  const allTasks = taskService.findAll()
  allTasks.forEach(task => {
    const status = task.completed ? '✓' : '○'
    const assignee = task.assigneeId
      ? userService.findById(task.assigneeId)?.name || 'Unknown'
      : 'Unassigned'
    console.log(`${status} ${task.title} - ${assignee} - ${formatDateTime(task.createdAt)}`)
  })
  console.log()

  console.log('=== Example completed successfully! ===')
  console.log()
  console.log('This example demonstrates:')
  console.log('- Feature modules with public APIs (user, tasks)')
  console.log('- Shared utilities (formatDateTime)')
  console.log('- Module independence and clear boundaries')
  console.log('- Stricture enforcement of modular architecture')
}

main()
