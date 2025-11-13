/**
 * CLI Framework (Layer 3 - Frameworks & Drivers)
 *
 * This is the outermost layer containing framework-specific code.
 * It handles command-line argument parsing and error handling.
 *
 * The CLI receives the controller via dependency injection.
 * It knows nothing about gateways, presenters, or how things are wired.
 */

import { TaskController } from '../interface-adapters/task-controller.js'

/**
 * Command-Line Interface
 */
export class CLI {
  constructor(private readonly taskController: TaskController) {}

  /**
   * Run the CLI with provided arguments
   */
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
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n❌ Error: ${error.message}\n`)
      }
      process.exit(1)
    }
  }

  /**
   * Handle create command
   */
  private async handleCreate(args: string[]): Promise<void> {
    const [title, description, priority] = args

    if (!title || !description) {
      console.error('\n❌ Error: Missing required arguments\n')
      console.log('Usage: create <title> <description> <priority>')
      console.log('Example: create "Buy milk" "Get 2% milk from store" high\n')
      return
    }

    await this.taskController.handleCreateTask(
      title,
      description,
      priority || 'medium'
    )
  }

  /**
   * Handle list command
   */
  private async handleList(): Promise<void> {
    await this.taskController.handleListTasks()
  }

  /**
   * Handle complete command
   */
  private async handleComplete(args: string[]): Promise<void> {
    const [taskId] = args

    if (!taskId) {
      console.error('\n❌ Error: Missing task ID\n')
      console.log('Usage: complete <task-id>')
      console.log('Example: complete task_abc123def\n')
      return
    }

    await this.taskController.handleCompleteTask(taskId)
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log('')
    console.log('📋 Task Manager - Clean Architecture Example')
    console.log('')
    console.log('Usage: node index.js <command> [args]')
    console.log('')
    console.log('Commands:')
    console.log('  create <title> <description> <priority>  Create a new task')
    console.log('    Priorities: low, medium, high')
    console.log(
      '    Example: node index.js create "Buy milk" "Get 2% milk" high'
    )
    console.log('')
    console.log('  list                                      List all tasks')
    console.log('    Example: node index.js list')
    console.log('')
    console.log('  complete <task-id>                        Mark task as complete')
    console.log('    Example: node index.js complete task_abc123def')
    console.log('')
    console.log('  help                                      Show this help message')
    console.log('')
  }
}
