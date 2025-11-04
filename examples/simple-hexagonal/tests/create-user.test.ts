import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateUserUseCase } from '../src/core/application/create-user'
import { UserRepository } from '../src/core/ports/user-repository'
import { User } from '../src/core/domain/user'

describe('CreateUserUseCase', () => {
  let mockRepository: UserRepository
  let useCase: CreateUserUseCase

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    }
    useCase = new CreateUserUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should create and save a valid user', async () => {
      const result = await useCase.execute('John Doe', 'john@example.com')

      expect(result).toBeInstanceOf(User)
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.id).toBeDefined()
      expect(result.id).toMatch(/^user_/)
      expect(mockRepository.save).toHaveBeenCalledOnce()
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should generate unique IDs for different users', async () => {
      const user1 = await useCase.execute('John Doe', 'john@example.com')
      const user2 = await useCase.execute('Jane Doe', 'jane@example.com')

      expect(user1.id).not.toBe(user2.id)
      expect(mockRepository.save).toHaveBeenCalledTimes(2)
    })

    it('should throw error for invalid email', async () => {
      await expect(
        useCase.execute('John Doe', 'invalid-email')
      ).rejects.toThrow('Invalid email format')

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should throw error for empty name', async () => {
      await expect(
        useCase.execute('', 'john@example.com')
      ).rejects.toThrow('Name cannot be empty')

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should throw error for whitespace-only name', async () => {
      await expect(
        useCase.execute('   ', 'john@example.com')
      ).rejects.toThrow('Name cannot be empty')

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should handle repository save errors', async () => {
      const saveError = new Error('Database connection failed')
      vi.mocked(mockRepository.save).mockRejectedValue(saveError)

      await expect(
        useCase.execute('John Doe', 'john@example.com')
      ).rejects.toThrow('Database connection failed')
    })

    it('should return user with proper business methods', async () => {
      const user = await useCase.execute('John Doe', 'john@example.com')

      expect(user.getDisplayName()).toBe('John Doe (john@example.com)')
    })

    it('should preserve user data through save operation', async () => {
      let savedUser: User | undefined

      vi.mocked(mockRepository.save).mockImplementation(async (user: User) => {
        savedUser = user
      })

      const result = await useCase.execute('Jane Smith', 'jane@example.com')

      expect(savedUser).toBeDefined()
      expect(savedUser?.name).toBe('Jane Smith')
      expect(savedUser?.email).toBe('jane@example.com')
      expect(savedUser?.id).toBe(result.id)
    })

    it('should handle special characters in name', async () => {
      const user = await useCase.execute("O'Brien-Smith", 'obrien@example.com')

      expect(user.name).toBe("O'Brien-Smith")
      expect(mockRepository.save).toHaveBeenCalledOnce()
    })

    it('should handle unicode characters in name', async () => {
      const user = await useCase.execute('José García', 'jose@example.com')

      expect(user.name).toBe('José García')
      expect(mockRepository.save).toHaveBeenCalledOnce()
    })

    it('should handle email with subdomains', async () => {
      const user = await useCase.execute('John Doe', 'john@mail.example.com')

      expect(user.email).toBe('john@mail.example.com')
      expect(mockRepository.save).toHaveBeenCalledOnce()
    })

    it('should handle email with plus addressing', async () => {
      const user = await useCase.execute('John Doe', 'john+test@example.com')

      expect(user.email).toBe('john+test@example.com')
      expect(mockRepository.save).toHaveBeenCalledOnce()
    })
  })

  describe('ID generation', () => {
    it('should generate IDs with correct prefix', async () => {
      const user = await useCase.execute('John Doe', 'john@example.com')

      expect(user.id).toMatch(/^user_[a-z0-9]+$/)
    })

    it('should generate IDs of reasonable length', async () => {
      const user = await useCase.execute('John Doe', 'john@example.com')

      // ID should be "user_" + 9 random characters
      expect(user.id.length).toBeGreaterThan(10)
      expect(user.id.length).toBeLessThan(20)
    })

    it('should generate different IDs on subsequent calls', async () => {
      const ids = new Set<string>()

      for (let i = 0; i < 10; i++) {
        const user = await useCase.execute(`User ${i}`, `user${i}@example.com`)
        ids.add(user.id)
      }

      // All IDs should be unique
      expect(ids.size).toBe(10)
    })
  })

  describe('dependency injection', () => {
    it('should use the injected repository', async () => {
      const customMockRepository: UserRepository = {
        save: vi.fn(),
        findById: vi.fn(),
        findAll: vi.fn(),
      }

      const customUseCase = new CreateUserUseCase(customMockRepository)
      await customUseCase.execute('John Doe', 'john@example.com')

      expect(customMockRepository.save).toHaveBeenCalledOnce()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })
})
