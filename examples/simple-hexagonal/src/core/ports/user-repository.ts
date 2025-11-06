import type { User } from '../domain/user.js'

/**
 * UserRepository port - Interface that defines the contract for user persistence
 *
 * This is a "port" in hexagonal architecture:
 * - Defines WHAT operations are needed (not HOW they're implemented)
 * - Uses domain types (User entity)
 * - Adapters will implement this interface
 * - Application layer depends on this interface, not on concrete implementations
 */
export interface UserRepository {
  /**
   * Save a user
   */
  save(user: User): Promise<void>

  /**
   * Find a user by their unique ID
   */
  findById(id: string): Promise<User | null>

  /**
   * Find all users
   */
  findAll(): Promise<User[]>
}
