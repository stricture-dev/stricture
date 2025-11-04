import { describe, it, expect } from 'vitest'
import { User } from '../src/core/domain/user'

describe('User', () => {
  describe('constructor', () => {
    it('should create a valid user with correct data', () => {
      const user = new User('user_123', 'John Doe', 'john@example.com')

      expect(user.id).toBe('user_123')
      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
    })

    it('should throw error for invalid email without @', () => {
      expect(() => {
        new User('user_123', 'John Doe', 'invalid-email.com')
      }).toThrow('Invalid email format')
    })

    it('should throw error for invalid email without dot', () => {
      expect(() => {
        new User('user_123', 'John Doe', 'invalid@email')
      }).toThrow('Invalid email format')
    })

    it('should throw error for completely invalid email', () => {
      expect(() => {
        new User('user_123', 'John Doe', 'not-an-email')
      }).toThrow('Invalid email format')
    })

    it('should throw error for empty email', () => {
      expect(() => {
        new User('user_123', 'John Doe', '')
      }).toThrow('Invalid email format')
    })

    it('should throw error for empty name', () => {
      expect(() => {
        new User('user_123', '', 'john@example.com')
      }).toThrow('Name cannot be empty')
    })

    it('should throw error for whitespace-only name', () => {
      expect(() => {
        new User('user_123', '   ', 'john@example.com')
      }).toThrow('Name cannot be empty')
    })

    it('should accept name with leading/trailing whitespace', () => {
      const user = new User('user_123', '  John Doe  ', 'john@example.com')

      expect(user.name).toBe('  John Doe  ')
    })

    it('should accept valid email with subdomain', () => {
      const user = new User('user_123', 'Jane Doe', 'jane@mail.example.com')

      expect(user.email).toBe('jane@mail.example.com')
    })

    it('should accept email with plus addressing', () => {
      const user = new User('user_123', 'Jane Doe', 'jane+test@example.com')

      expect(user.email).toBe('jane+test@example.com')
    })
  })

  describe('getDisplayName', () => {
    it('should return formatted display name', () => {
      const user = new User('user_123', 'John Doe', 'john@example.com')

      expect(user.getDisplayName()).toBe('John Doe (john@example.com)')
    })

    it('should handle special characters in name', () => {
      const user = new User('user_123', "O'Brien", 'obrien@example.com')

      expect(user.getDisplayName()).toBe("O'Brien (obrien@example.com)")
    })

    it('should handle unicode characters in name', () => {
      const user = new User('user_123', 'José García', 'jose@example.com')

      expect(user.getDisplayName()).toBe('José García (jose@example.com)')
    })
  })
})
