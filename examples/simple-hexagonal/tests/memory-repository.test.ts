import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryUserRepository } from '../src/adapters/driven/memory-repository'
import { User } from '../src/core/domain/user'

describe('MemoryUserRepository', () => {
  let repository: MemoryUserRepository

  beforeEach(() => {
    repository = new MemoryUserRepository()
  })

  describe('save', () => {
    it('should save a user', async () => {
      const user = new User('user_123', 'John Doe', 'john@example.com')

      await repository.save(user)

      const savedUser = await repository.findById('user_123')
      expect(savedUser).toBeDefined()
      expect(savedUser?.id).toBe('user_123')
      expect(savedUser?.name).toBe('John Doe')
      expect(savedUser?.email).toBe('john@example.com')
    })

    it('should update an existing user when saving with same ID', async () => {
      const user1 = new User('user_123', 'John Doe', 'john@example.com')
      await repository.save(user1)

      const user2 = new User('user_123', 'Jane Doe', 'jane@example.com')
      await repository.save(user2)

      const savedUser = await repository.findById('user_123')
      expect(savedUser?.name).toBe('Jane Doe')
      expect(savedUser?.email).toBe('jane@example.com')
    })

    it('should save multiple users with different IDs', async () => {
      const user1 = new User('user_1', 'John Doe', 'john@example.com')
      const user2 = new User('user_2', 'Jane Doe', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = new User('user_123', 'John Doe', 'john@example.com')
      await repository.save(user)

      const foundUser = await repository.findById('user_123')

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe('user_123')
      expect(foundUser?.name).toBe('John Doe')
      expect(foundUser?.email).toBe('john@example.com')
    })

    it('should return null when user not found', async () => {
      const foundUser = await repository.findById('nonexistent')

      expect(foundUser).toBeNull()
    })

    it('should return null for empty string ID', async () => {
      const foundUser = await repository.findById('')

      expect(foundUser).toBeNull()
    })

    it('should distinguish between different user IDs', async () => {
      const user1 = new User('user_1', 'John Doe', 'john@example.com')
      const user2 = new User('user_2', 'Jane Doe', 'jane@example.com')

      await repository.save(user1)
      await repository.save(user2)

      const foundUser1 = await repository.findById('user_1')
      const foundUser2 = await repository.findById('user_2')

      expect(foundUser1?.name).toBe('John Doe')
      expect(foundUser2?.name).toBe('Jane Doe')
    })
  })

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll()

      expect(users).toEqual([])
      expect(users).toHaveLength(0)
    })

    it('should return all saved users', async () => {
      const user1 = new User('user_1', 'John Doe', 'john@example.com')
      const user2 = new User('user_2', 'Jane Doe', 'jane@example.com')
      const user3 = new User('user_3', 'Bob Smith', 'bob@example.com')

      await repository.save(user1)
      await repository.save(user2)
      await repository.save(user3)

      const users = await repository.findAll()

      expect(users).toHaveLength(3)
      expect(users.map(u => u.id)).toContain('user_1')
      expect(users.map(u => u.id)).toContain('user_2')
      expect(users.map(u => u.id)).toContain('user_3')
    })

    it('should return updated user data after save', async () => {
      const user1 = new User('user_1', 'John Doe', 'john@example.com')
      await repository.save(user1)

      const user1Updated = new User('user_1', 'John Updated', 'updated@example.com')
      await repository.save(user1Updated)

      const users = await repository.findAll()

      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('John Updated')
      expect(users[0].email).toBe('updated@example.com')
    })

    it('should return array of User instances', async () => {
      const user = new User('user_1', 'John Doe', 'john@example.com')
      await repository.save(user)

      const users = await repository.findAll()

      expect(users[0]).toBeInstanceOf(User)
      expect(users[0].getDisplayName()).toBe('John Doe (john@example.com)')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create
      const user = new User('user_1', 'John Doe', 'john@example.com')
      await repository.save(user)

      // Read
      let foundUser = await repository.findById('user_1')
      expect(foundUser?.name).toBe('John Doe')

      // Update
      const updatedUser = new User('user_1', 'John Updated', 'john.updated@example.com')
      await repository.save(updatedUser)

      // Verify update
      foundUser = await repository.findById('user_1')
      expect(foundUser?.name).toBe('John Updated')

      // List
      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(1)
    })

    it('should maintain data integrity across operations', async () => {
      // Save multiple users
      await repository.save(new User('user_1', 'User One', 'one@example.com'))
      await repository.save(new User('user_2', 'User Two', 'two@example.com'))
      await repository.save(new User('user_3', 'User Three', 'three@example.com'))

      // Verify all are saved
      expect((await repository.findAll())).toHaveLength(3)

      // Update one user
      await repository.save(new User('user_2', 'Updated Two', 'updated@example.com'))

      // Verify update didn't affect others
      const allUsers = await repository.findAll()
      expect(allUsers).toHaveLength(3)
      expect(allUsers.find(u => u.id === 'user_1')?.name).toBe('User One')
      expect(allUsers.find(u => u.id === 'user_2')?.name).toBe('Updated Two')
      expect(allUsers.find(u => u.id === 'user_3')?.name).toBe('User Three')
    })
  })
})
