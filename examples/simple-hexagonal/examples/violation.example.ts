/**
 * ARCHITECTURAL VIOLATION EXAMPLE
 *
 * This file demonstrates what happens when you break hexagonal architecture rules.
 * Keep this file commented out - it's just for educational purposes!
 *
 * If you uncomment the code below and run `npm run lint`, you'll see Stricture
 * catch the violation and report it.
 */

/*
// ❌ BAD EXAMPLE - Domain importing from adapter layer
// src/core/domain/user.ts

import { MemoryUserRepository } from '../../adapters/memory-repository'  // ❌ VIOLATION!

export class User {
  // This violates the domain isolation rule!
  // Domain should never know about infrastructure details like repositories
  private repository = new MemoryUserRepository()  // ❌ VIOLATION!

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}

// When you run: npm run lint
// You'll see:
//
//   src/core/domain/user.ts
//   3:1  error  Domain layer cannot import from adapters
//               Domain must remain pure - no external dependencies
//               @stricture/enforce-boundaries
//
// This error prevents you from breaking the architecture!
*/

/*
// ❌ ANOTHER BAD EXAMPLE - Application importing concrete adapter
// src/core/application/create-user.ts

import { MemoryUserRepository } from '../../adapters/memory-repository'  // ❌ VIOLATION!
import { User } from '../domain/user'

export class CreateUserUseCase {
  // Application should depend on port interface, not concrete adapter!
  private repository = new MemoryUserRepository()  // ❌ VIOLATION!

  async execute(name: string, email: string): Promise<User> {
    const user = new User(`user_${Date.now()}`, name, email)
    await this.repository.save(user)
    return user
  }
}

// When you run: npm run lint
// You'll see:
//
//   src/core/application/create-user.ts
//   3:1  error  Application layer cannot import adapters directly
//               Application layer should depend on port interfaces, not concrete adapter implementations
//               @stricture/enforce-boundaries
*/

// ✅ GOOD EXAMPLES - How to do it correctly

// Domain layer - Pure business logic, no imports from other layers
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    if (!email.includes('@')) {
      throw new Error('Invalid email')
    }
  }
}

// Ports layer - Interface definitions
export interface UserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
}

// Application layer - Depends on port interface (not concrete implementation)
export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}  // ✅ Depends on interface!

  async execute(name: string, email: string): Promise<User> {
    const user = new User(`user_${Date.now()}`, name, email)
    await this.repository.save(user)
    return user
  }
}

// Adapter layer - Implements the port interface
export class MemoryUserRepository implements UserRepository {
  private users = new Map<string, User>()

  async save(user: User): Promise<void> {
    this.users.set(user.id, user)
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }
}
