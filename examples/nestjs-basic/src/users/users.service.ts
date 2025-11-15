import { Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UserDto } from './dto/user.dto'

/**
 * UsersService - Business logic layer
 * Works with entities internally, returns DTOs for API
 */
@Injectable()
export class UsersService {
  private users: User[] = []
  private nextId = 1

  async create(dto: CreateUserDto): Promise<UserDto> {
    // Create entity from DTO
    const user: User = {
      id: this.nextId++,
      email: dto.email,
      name: dto.name,
      passwordHash: `hashed_${dto.password}`,  // Simplified hashing
      createdAt: new Date()
    }

    this.users.push(user)

    // Convert entity to DTO before returning
    return this.toDto(user)
  }

  async findAll(): Promise<UserDto[]> {
    // Map entities to DTOs
    return this.users.map(u => this.toDto(u))
  }

  async findOne(id: number): Promise<UserDto | null> {
    const user = this.users.find(u => u.id === id)
    return user ? this.toDto(user) : null
  }

  /**
   * Convert entity to DTO
   * Excludes sensitive fields like passwordHash
   */
  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
      // passwordHash is NOT included in DTO
    }
  }
}
