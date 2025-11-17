/**
 * User Profile Query
 * Business logic for fetching user data
 */

import { db } from '../../shared/database/client.js'

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

/**
 * Get user by ID
 * @param userId - User's unique identifier
 * @returns User object or null if not found
 */
export async function getUserById(userId: string): Promise<User | null> {
  const user = db.users.get(userId)
  return user || null
}
