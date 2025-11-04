import { User } from '../../core/domain/user.js'
import { UserRepository } from '../../core/ports/user-repository.js'

/**
 * In-memory implementation of UserRepository
 *
 * This is an "adapter" in hexagonal architecture:
 * - Implements a port interface (UserRepository)
 * - Handles infrastructure concerns (storage)
 * - Can be swapped with other implementations (PostgresRepository, MongoRepository, etc.)
 * - Domain and application layers don't know about this implementation
 */
export class MemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map()

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values())
  }
}
