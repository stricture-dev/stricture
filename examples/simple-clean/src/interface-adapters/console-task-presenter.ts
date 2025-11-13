/**
 * Console Task Presenter (Layer 2 - Interface Adapters)
 *
 * This presenter implements the TaskOutputPort interface defined in the use-cases layer.
 * It formats task data for console output.
 *
 * Presenters convert use case output into a format suitable for the delivery mechanism.
 */

import { Task } from '../entities/task.js'
import { TaskOutputPort } from '../use-cases/output-port.js'

/**
 * Console-based implementation of TaskOutputPort
 */
export class ConsoleTaskPresenter implements TaskOutputPort {
  presentTask(task: Task): void {
    console.log('')
    console.log('📋 Task Details:')
    console.log(`  ID: ${task.id}`)
    console.log(`  Title: ${task.title}`)
    console.log(`  Description: ${task.description}`)
    console.log(`  Status: ${task.status}`)
    console.log(`  Priority: ${task.priority}`)
    console.log(`  Created: ${task.createdAt.toLocaleString()}`)
    if (task.completedAt) {
      console.log(`  Completed: ${task.completedAt.toLocaleString()}`)
    }
    console.log('')
  }

  presentTaskList(tasks: Task[]): void {
    console.log('')
    console.log(`📋 Tasks (${tasks.length}):`)
    console.log('')

    if (tasks.length === 0) {
      console.log('  No tasks found')
      console.log('')
      return
    }

    tasks.forEach((task) => {
      console.log(`  ${task.getDisplayTitle()}`)
      console.log(`    ID: ${task.id}`)
      if (task.isOverdue()) {
        console.log('    ⚠️  OVERDUE')
      }
    })
    console.log('')
  }

  presentError(message: string): void {
    console.error('')
    console.error(`❌ Error: ${message}`)
    console.error('')
  }

  presentSuccess(message: string): void {
    console.log('')
    console.log(`✅ ${message}`)
    console.log('')
  }
}
