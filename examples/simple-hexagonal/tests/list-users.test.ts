import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListUsersUseCase } from '../src/core/application/list-users'
import { UserRepository } from '../src/core/ports/user-repository'
import { User } from '../src/core/domain/user'

describe('ListUsersUseCase', () => {
  let mockRepository: UserRepository
  let useCase: ListUsersUseCase

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    }
    useCase = new ListUsersUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should return empty array when no users exist', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([])

      const result = await useCase.execute()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
      expect(mockRepository.findAll).toHaveBeenCalledOnce()
    })

    it('should return all users from repository', async () => {
      const users = [
        new User('user_1', 'John Doe', 'john@example.com'),
        new User('user_2', 'Jane Doe', 'jane@example.com'),
        new User('user_3', 'Bob Smith', 'bob@example.com'),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result).toHaveLength(3)
      expect(result).toEqual(users)
      expect(mockRepository.findAll).toHaveBeenCalledOnce()
    })

    it('should return a single user when only one exists', async () => {
      const users = [new User('user_1', 'John Doe', 'john@example.com')]

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('John Doe')
      expect(result[0].email).toBe('john@example.com')
    })

    it('should preserve user instance types', async () => {
      const users = [
        new User('user_1', 'John Doe', 'john@example.com'),
        new User('user_2', 'Jane Doe', 'jane@example.com'),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result[0]).toBeInstanceOf(User)
      expect(result[1]).toBeInstanceOf(User)
      expect(result[0].getDisplayName()).toBe('John Doe (john@example.com)')
      expect(result[1].getDisplayName()).toBe('Jane Doe (jane@example.com)')
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed')
      vi.mocked(mockRepository.findAll).mockRejectedValue(error)

      await expect(useCase.execute()).rejects.toThrow('Database connection failed')
    })

    it('should return users with all properties intact', async () => {
      const users = [
        new User('user_123', 'John Doe', 'john@example.com'),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result[0].id).toBe('user_123')
      expect(result[0].name).toBe('John Doe')
      expect(result[0].email).toBe('john@example.com')
    })

    it('should handle large number of users', async () => {
      const users = Array.from({ length: 100 }, (_, i) =>
        new User(`user_${i}`, `User ${i}`, `user${i}@example.com`)
      )

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result).toHaveLength(100)
      expect(result[0].name).toBe('User 0')
      expect(result[99].name).toBe('User 99')
    })

    it('should maintain user order returned by repository', async () => {
      const users = [
        new User('user_3', 'Charlie', 'charlie@example.com'),
        new User('user_1', 'Alice', 'alice@example.com'),
        new User('user_2', 'Bob', 'bob@example.com'),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(users)

      const result = await useCase.execute()

      expect(result[0].name).toBe('Charlie')
      expect(result[1].name).toBe('Alice')
      expect(result[2].name).toBe('Bob')
    })

    it('should not modify the repository', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([])

      await useCase.execute()

      expect(mockRepository.save).not.toHaveBeenCalled()
      expect(mockRepository.findById).not.toHaveBeenCalled()
    })
  })

  describe('dependency injection', () => {
    it('should use the injected repository', async () => {
      const customMockRepository: UserRepository = {
        save: vi.fn(),
        findById: vi.fn(),
        findAll: vi.fn().mockResolvedValue([]),
      }

      const customUseCase = new ListUsersUseCase(customMockRepository)
      await customUseCase.execute()

      expect(customMockRepository.findAll).toHaveBeenCalledOnce()
      expect(mockRepository.findAll).not.toHaveBeenCalled()
    })
  })

  describe('integration with CreateUserUseCase', () => {
    it('should work seamlessly with repository mutations', async () => {
      const repository = mockRepository
      const users: User[] = []

      vi.mocked(repository.findAll).mockImplementation(async () => [...users])
      vi.mocked(repository.save).mockImplementation(async (user: User) => {
        users.push(user)
      })

      // Initially empty
      let result = await useCase.execute()
      expect(result).toHaveLength(0)

      // Simulate user creation
      const user1 = new User('user_1', 'John', 'john@example.com')
      await repository.save(user1)

      result = await useCase.execute()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('John')

      // Simulate another user creation
      const user2 = new User('user_2', 'Jane', 'jane@example.com')
      await repository.save(user2)

      result = await useCase.execute()
      expect(result).toHaveLength(2)
    })
  })
})
