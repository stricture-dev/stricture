import { CreateUserUseCase } from '../../core/application/create-user.js'
import { ListUsersUseCase } from '../../core/application/list-users.js'
import { MemoryUserRepository } from '../driven/memory-repository.js'

/**
 * CLI adapter - Entry point for terminal commands
 *
 * This is another "adapter" that provides a CLI interface:
 * - Adapts terminal input/output to use cases
 * - Creates and wires dependencies (dependency injection)
 * - Could be swapped with HTTP adapter, GraphQL adapter, etc.
 */
export class CliAdapter {
  private readonly repository = new MemoryUserRepository()
  private readonly createUserUseCase = new CreateUserUseCase(this.repository)
  private readonly listUsersUseCase = new ListUsersUseCase(this.repository)

  async run(args: string[]): Promise<void> {
    const command = args[0]

    try {
      switch (command) {
        case 'create':
          await this.handleCreate(args[1], args[2])
          break
        case 'list':
          await this.handleList()
          break
        default:
          this.showHelp()
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error: ${error.message}`)
        process.exit(1)
      }
      throw error
    }
  }

  private async handleCreate(name: string, email: string): Promise<void> {
    if (!name || !email) {
      console.error('❌ Usage: create <name> <email>')
      process.exit(1)
    }

    const user = await this.createUserUseCase.execute(name, email)

    console.log('✅ User created successfully!')
    console.log(`ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
    console.log(`Email: ${user.email}`)
  }

  private async handleList(): Promise<void> {
    const users = await this.listUsersUseCase.execute()

    if (users.length === 0) {
      console.log('📋 No users found')
      return
    }

    console.log(`📋 Users (${users.length}):`)
    users.forEach(user => {
      console.log(`- ${user.getDisplayName()}`)
    })
  }

  private showHelp(): void {
    console.log('Usage:')
    console.log('  create <name> <email>  - Create a new user')
    console.log('  list                   - List all users')
    console.log('')
    console.log('Examples:')
    console.log('  node index.js create "John Doe" "john@example.com"')
    console.log('  node index.js list')
  }
}
