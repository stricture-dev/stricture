import { User } from '../domain/user'
import { UserRepository } from '../ports/user-repository'

/**
 * ListUsers use case - Retrieve all users
 *
 * Another example of application layer use case
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll()
  }
}
