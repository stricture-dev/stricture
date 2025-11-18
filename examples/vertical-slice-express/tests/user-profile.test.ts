import { describe, it, expect, beforeEach } from 'vitest'
import { getUserById } from '../src/features/user-profile/query.js'
import { db } from '../src/shared/database/client.js'

describe('User Profile', () => {
  beforeEach(() => {
    db.users.clear()
  })

  describe('getUserById query', () => {
    it('should return user when user exists', async () => {
      // Setup: Add a user to the database
      const user = {
        id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date('2025-01-01')
      }
      db.users.set(user.id, user)

      // Execute
      const result = await getUserById('user_123')

      // Verify
      expect(result).toEqual(user)
    })

    it('should return null when user does not exist', async () => {
      const result = await getUserById('nonexistent_id')

      expect(result).toBeNull()
    })

    it('should return null for empty database', async () => {
      const result = await getUserById('any_id')

      expect(result).toBeNull()
    })

    it('should distinguish between different users', async () => {
      // Setup: Add multiple users
      const user1 = {
        id: 'user_1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date()
      }
      const user2 = {
        id: 'user_2',
        name: 'Bob',
        email: 'bob@example.com',
        createdAt: new Date()
      }
      db.users.set(user1.id, user1)
      db.users.set(user2.id, user2)

      // Execute
      const result = await getUserById('user_1')

      // Verify
      expect(result).toEqual(user1)
      expect(result).not.toEqual(user2)
    })
  })
})
