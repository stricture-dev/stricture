/**
 * Presentation Layer - CLI
 * 
 * Handles user input from command line and displays output.
 * Presentation layer is the topmost layer that calls application layer.
 */

import { CreateTaskUseCase } from '../application/create-task.js'
import { ListTasksUseCase } from '../application/list-tasks.js'
import { CompleteTaskUseCase } from '../application/complete-task.js'
import { Priority, Task } from '../domain/task.js'

export class CLI {
  constructor(
    private createTask: CreateTaskUseCase,
    private listTasks: ListTasksUseCase,
    private completeTask: CompleteTaskUseCase
  ) {}

  async run(args: string[]): Promise<void> {
    const command = args[0]

    try {
      switch (command) {
        case 'create':
          await this.handleCreate(args.slice(1))
          break
        case 'list':
          await this.handleList()
          break
        case 'complete':
          await this.handleComplete(args.slice(1))
          break
        case 'help':
        default:
          this.showHelp()
          break
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  }

  private async handleCreate(args: string[]): Promise<void> {
    const [title, description, priority = 'MEDIUM'] = args

    if (!title) {
      console.error('Usage: create <title> <description> [priority]')
      console.error('Priority: LOW, MEDIUM, HIGH')
      process.exit(1)
    }

    const task = await this.createTask.execute({
      title,
      description: description || '',
      priority: priority.toUpperCase() as Priority
    })

    console.log('Task "' + task.title + '" created successfully\n')
    this.displayTask(task)
  }

  private async handleList(): Promise<void> {
    const tasks = await this.listTasks.execute()

    if (tasks.length === 0) {
      console.log('No tasks yet. Create one with: create <title> <description>')
      return
    }

    console.log('Tasks (' + tasks.length + '):\n')
    tasks.forEach(task => {
      const statusIcon = task.status === 'DONE' ? 'DONE' : task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO'
      const priorityIcon = task.priority === 'HIGH' ? 'HIGH' : task.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW'
      console.log('  [' + statusIcon + '] [' + priorityIcon + '] ' + task.title)
      console.log('    ID: ' + task.id)
      if (task.description) {
        console.log('    Description: ' + task.description)
      }
      console.log()
    })
  }

  private async handleComplete(args: string[]): Promise<void> {
    const [taskId] = args

    if (!taskId) {
      console.error('Usage: complete <task-id>')
      process.exit(1)
    }

    const task = await this.completeTask.execute(taskId)
    console.log('Task "' + task.title + '" completed\n')
    this.displayTask(task)
  }

  private displayTask(task: Task): void {
    console.log('Task Details:')
    console.log('  ID: ' + task.id)
    console.log('  Title: ' + task.title)
    if (task.description) {
      console.log('  Description: ' + task.description)
    }
    console.log('  Status: ' + task.status)
    console.log('  Priority: ' + task.priority)
    console.log('  Created: ' + task.createdAt.toLocaleString())
    if (task.completedAt) {
      console.log('  Completed: ' + task.completedAt.toLocaleString())
    }
  }

  private showHelp(): void {
    console.log('Task Manager CLI')
    console.log('\nCommands:')
    console.log('  create <title> <description> [priority]  - Create a new task')
    console.log('  list                                      - List all tasks')
    console.log('  complete <task-id>                        - Mark task as complete')
    console.log('  help                                      - Show this help')
    console.log('\nExamples:')
    console.log('  create "Buy groceries" "Get milk and eggs" high')
    console.log('  list')
    console.log('  complete task_123456')
  }
}
