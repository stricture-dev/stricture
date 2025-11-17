import { describe, it, expect, beforeEach } from 'vitest'
import { registerUser } from '../src/features/user-registration/command.js'
import { validateRegistration } from '../src/features/user-registration/validator.js'
import { db } from '../src/shared/database/client.js'

describe('User Registration', () => {
  beforeEach(() => {
    db.users.clear()
  })

  describe('registerUser command', () => {
    it('should create a user with valid input', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }

      const user = await registerUser(input)

      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
      expect(user.id).toMatch(/^user_/)
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should persist user to database', async () => {
      const input = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456'
      }

      const user = await registerUser(input)
      const retrieved = db.users.get(user.id)

      expect(retrieved).toEqual(user)
    })
  })

  describe('validateRegistration validator', () => {
    it('should accept valid registration data', () => {
      const body = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'securepassword'
      }

      const result = validateRegistration(body)

      expect(result.valid).toBe(true)
      expect(result.data).toEqual({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'securepassword'
      })
    })

    it('should reject missing name', () => {
      const body = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = validateRegistration(body)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Name')
    })

    it('should reject invalid email', () => {
      const body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const result = validateRegistration(body)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('email')
    })

    it('should reject short password', () => {
      const body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short'
      }

      const result = validateRegistration(body)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Password')
    })
  })
})
