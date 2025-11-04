import { User } from '../domain/user.js'
import { UserRepository } from '../ports/user-repository.js'

/**
 * CreateUser use case - Application layer orchestration
 *
 * This is the "application" layer in hexagonal architecture:
 * - Orchestrates domain entities and port interfaces
 * - Contains use case / business workflow logic
 * - Depends on ports (interfaces), not adapters (implementations)
 * - Stateless - dependencies are injected via constructor
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    // Generate unique ID (in real app, might be UUID)
    const id = this.generateId()

    // Create domain entity (validation happens in constructor)
    const user = new User(id, name, email)

    // Persist using the port interface
    await this.userRepository.save(user)

    return user
  }

  private generateId(): string {
    return `user_${Math.random().toString(36).substr(2, 9)}`
  }
}
