/**
 * User service (private to this module)
 */

import type { User, CreateUserInput } from './types.js'

// In-memory storage for demo
const users: Map<string, User> = new Map()

export class UserService {
  create(input: CreateUserInput): User {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.name,
      email: input.email,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    users.set(user.id, user)
    return user
  }

  findById(id: string): User | undefined {
    return users.get(id)
  }

  findAll(): User[] {
    return Array.from(users.values())
  }
}
