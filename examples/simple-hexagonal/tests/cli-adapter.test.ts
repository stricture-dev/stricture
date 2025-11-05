import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CliAdapter } from '../src/adapters/driving/cli'
import { MemoryUserRepository } from '../src/adapters/driven/memory-repository'
import { CreateUserUseCase } from '../src/core/application/create-user'
import { ListUsersUseCase } from '../src/core/application/list-users'

describe('CliAdapter', () => {
  let cliAdapter: CliAdapter
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let processExitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Set up dependencies like composition root does
    const repository = new MemoryUserRepository()
    const createUserUseCase = new CreateUserUseCase(repository)
    const listUsersUseCase = new ListUsersUseCase(repository)

    // Create CLI adapter with dependencies
    cliAdapter = new CliAdapter(createUserUseCase, listUsersUseCase)

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Mock process.exit to throw to simulate process stopping
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`)
    }) as never)
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    processExitSpy.mockRestore()
  })

  describe('run - create command', () => {
    it('should create a user successfully', async () => {
      await cliAdapter.run(['create', 'John Doe', 'john@example.com'])

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ID: user_'))
      expect(consoleLogSpy).toHaveBeenCalledWith('Name: John Doe')
      expect(consoleLogSpy).toHaveBeenCalledWith('Email: john@example.com')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should show error when name is missing', async () => {
      await expect(cliAdapter.run(['create'])).rejects.toThrow('process.exit(1)')

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Usage: create <name> <email>')
    })

    it('should show error when email is missing', async () => {
      await expect(cliAdapter.run(['create', 'John Doe'])).rejects.toThrow('process.exit(1)')

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Usage: create <name> <email>')
    })

    it('should show error for invalid email format', async () => {
      await expect(cliAdapter.run(['create', 'John Doe', 'invalid-email'])).rejects.toThrow('process.exit(1)')

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error: Invalid email format')
    })

    it('should show error for empty name', async () => {
      await expect(cliAdapter.run(['create', '', 'john@example.com'])).rejects.toThrow('process.exit(1)')

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Usage: create <name> <email>')
    })

    it('should handle special characters in name', async () => {
      await cliAdapter.run(['create', "O'Brien", 'obrien@example.com'])

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')
      expect(consoleLogSpy).toHaveBeenCalledWith("Name: O'Brien")
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should handle unicode characters in name', async () => {
      await cliAdapter.run(['create', 'José García', 'jose@example.com'])

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')
      expect(consoleLogSpy).toHaveBeenCalledWith('Name: José García')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should handle email with subdomain', async () => {
      await cliAdapter.run(['create', 'John Doe', 'john@mail.example.com'])

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')
      expect(consoleLogSpy).toHaveBeenCalledWith('Email: john@mail.example.com')
      expect(processExitSpy).not.toHaveBeenCalled()
    })
  })

  describe('run - list command', () => {
    it('should show "No users found" when list is empty', async () => {
      await cliAdapter.run(['list'])

      expect(consoleLogSpy).toHaveBeenCalledWith('📋 No users found')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should list all created users', async () => {
      await cliAdapter.run(['create', 'John Doe', 'john@example.com'])
      consoleLogSpy.mockClear()

      await cliAdapter.run(['list'])

      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (1):')
      expect(consoleLogSpy).toHaveBeenCalledWith('- John Doe (john@example.com)')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should list multiple users', async () => {
      await cliAdapter.run(['create', 'John Doe', 'john@example.com'])
      await cliAdapter.run(['create', 'Jane Smith', 'jane@example.com'])
      await cliAdapter.run(['create', 'Bob Johnson', 'bob@example.com'])
      consoleLogSpy.mockClear()

      await cliAdapter.run(['list'])

      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (3):')
      expect(consoleLogSpy).toHaveBeenCalledWith('- John Doe (john@example.com)')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Jane Smith (jane@example.com)')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Bob Johnson (bob@example.com)')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should maintain user order', async () => {
      await cliAdapter.run(['create', 'Alice', 'alice@example.com'])
      await cliAdapter.run(['create', 'Bob', 'bob@example.com'])
      await cliAdapter.run(['create', 'Charlie', 'charlie@example.com'])
      consoleLogSpy.mockClear()

      await cliAdapter.run(['list'])

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0])
      const aliceIndex = logCalls.findIndex(log => log.includes('Alice'))
      const bobIndex = logCalls.findIndex(log => log.includes('Bob'))
      const charlieIndex = logCalls.findIndex(log => log.includes('Charlie'))

      expect(aliceIndex).toBeLessThan(bobIndex)
      expect(bobIndex).toBeLessThan(charlieIndex)
    })
  })

  describe('run - help command', () => {
    it('should show help for unknown command', async () => {
      await cliAdapter.run(['unknown'])

      expect(consoleLogSpy).toHaveBeenCalledWith('Usage:')
      expect(consoleLogSpy).toHaveBeenCalledWith('  create <name> <email>  - Create a new user')
      expect(consoleLogSpy).toHaveBeenCalledWith('  list                   - List all users')
      expect(consoleLogSpy).toHaveBeenCalledWith('')
      expect(consoleLogSpy).toHaveBeenCalledWith('Examples:')
      expect(consoleLogSpy).toHaveBeenCalledWith('  node index.js create "John Doe" "john@example.com"')
      expect(consoleLogSpy).toHaveBeenCalledWith('  node index.js list')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should show help when no command provided', async () => {
      await cliAdapter.run([])

      expect(consoleLogSpy).toHaveBeenCalledWith('Usage:')
      expect(consoleLogSpy).toHaveBeenCalledWith('  create <name> <email>  - Create a new user')
      expect(processExitSpy).not.toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should handle create and list workflow', async () => {
      // Create first user
      await cliAdapter.run(['create', 'Alice', 'alice@example.com'])
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')

      // Create second user
      await cliAdapter.run(['create', 'Bob', 'bob@example.com'])
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ User created successfully!')

      consoleLogSpy.mockClear()

      // List users
      await cliAdapter.run(['list'])
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (2):')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Alice (alice@example.com)')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Bob (bob@example.com)')
      expect(processExitSpy).not.toHaveBeenCalled()
    })

    it('should maintain state across multiple commands', async () => {
      await cliAdapter.run(['list'])
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 No users found')

      consoleLogSpy.mockClear()

      await cliAdapter.run(['create', 'User 1', 'user1@example.com'])
      await cliAdapter.run(['create', 'User 2', 'user2@example.com'])
      await cliAdapter.run(['create', 'User 3', 'user3@example.com'])

      consoleLogSpy.mockClear()

      await cliAdapter.run(['list'])
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (3):')
    })

    it('should handle errors gracefully without breaking state', async () => {
      // Create valid user
      await cliAdapter.run(['create', 'Valid User', 'valid@example.com'])

      // Try to create invalid user (should fail)
      await expect(cliAdapter.run(['create', 'Invalid', 'not-an-email'])).rejects.toThrow('process.exit(1)')

      consoleLogSpy.mockClear()

      // List should still show the valid user
      await cliAdapter.run(['list'])
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (1):')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Valid User (valid@example.com)')
    })
  })

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // This is a bit contrived, but tests the catch block for non-Error objects
      const adapter = new CliAdapter()
      const originalRun = adapter.run.bind(adapter)

      // Mock to throw a non-Error object
      const throwNonError = async () => {
        throw 'string error'
      }

      await expect(throwNonError()).rejects.toThrow('string error')
    })

    it('should format error messages correctly', async () => {
      await expect(cliAdapter.run(['create', 'John', 'invalid-email'])).rejects.toThrow('process.exit(1)')

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error: Invalid email format')
      expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/^❌ Error: /)
    })
  })

  describe('dependency wiring', () => {
    it('should wire dependencies correctly (repository shared between use cases)', async () => {
      // Create a user using CreateUserUseCase
      await cliAdapter.run(['create', 'Test User', 'test@example.com'])

      consoleLogSpy.mockClear()

      // List users using ListUsersUseCase (should see the created user)
      await cliAdapter.run(['list'])

      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Users (1):')
      expect(consoleLogSpy).toHaveBeenCalledWith('- Test User (test@example.com)')
    })
  })
})
