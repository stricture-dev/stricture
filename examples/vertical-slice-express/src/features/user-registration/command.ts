/**
 * User Registration Command
 * Business logic for creating new users
 */

import { db } from '../../shared/database/client.js'

export interface RegisterUserInput {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

/**
 * Register a new user
 * @param input - User registration data
 * @returns Created user
 */
export async function registerUser(input: RegisterUserInput): Promise<User> {
  // Generate unique user ID
  const userId = generateUserId()
  const now = new Date()

  // Create user object
  const user: User = {
    id: userId,
    name: input.name,
    email: input.email,
    createdAt: now
  }

  // Persist to database
  await db.users.set(userId, user)

  return user
}

/**
 * Generate a unique user ID
 * In production, this could use UUID or database auto-increment
 */
function generateUserId(): string {
  return `user_${Math.random().toString(36).substr(2, 9)}`
}
