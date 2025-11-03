# Simple Hexagonal Architecture Example

> A minimal terminal app demonstrating hexagonal architecture with Stricture boundary enforcement

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This is a minimal, runnable example of **hexagonal architecture** (also known as the ports & adapters pattern). It demonstrates how `@stricture` enforces architectural boundaries in a real TypeScript project. The example implements a simple user creation system that stores users in memory and runs from the terminal—no databases, no HTTP servers, just the core architectural concepts.

This example exists as the perfect starting point for understanding hexagonal architecture. It shows how Stricture prevents common violations like the domain layer importing adapters, or the application layer depending on concrete infrastructure implementations. Unlike production examples, this one is deliberately simple and focused on architecture rather than features.

**What you'll learn:**
- How to structure a hexagonal architecture project from scratch
- How to configure Stricture for automatic boundary enforcement
- How ESLint catches architectural violations in real-time during development
- The dependency flow between domain, ports, application, and adapters

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     Outer Layer (Adapters)                 │
│  ┌──────────────┐                      ┌────────────────┐  │
│  │ CLI Adapter  │                      │   Memory       │  │
│  │  (cli.ts)    │                      │  Repository    │  │
│  └──────┬───────┘                      └────────┬───────┘  │
│         │                                       │          │
│         ↓                                       ↓          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Application Layer (Use Cases)             │  │
│  │  ┌───────────────┐      ┌──────────────────┐       │  │
│  │  │ CreateUser    │      │   ListUsers      │       │  │
│  │  │  (UseCase)    │      │   (UseCase)      │       │  │
│  │  └───────────────┘      └──────────────────┘       │  │
│  │         ↓                         ↓                 │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │         Ports Layer (Interfaces)             │  │  │
│  │  │  ┌────────────────────────────────────┐      │  │  │
│  │  │  │     UserRepository (interface)     │      │  │  │
│  │  │  └────────────────────────────────────┘      │  │  │
│  │  │                   ↓                          │  │  │
│  │  │  ┌────────────────────────────────────┐      │  │  │
│  │  │  │       Domain Layer (Entities)      │      │  │  │
│  │  │  │      ┌──────────────────┐          │      │  │  │
│  │  │  │      │  User (entity)   │          │      │  │  │
│  │  │  │      │  - Validation    │          │      │  │  │
│  │  │  │      │  - Business Logic│          │      │  │  │
│  │  │  │      └──────────────────┘          │      │  │  │
│  │  │  │     (Zero Dependencies)            │      │  │  │
│  │  │  └────────────────────────────────────┘      │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

Dependency Flow: Adapters → Application → Ports → Domain
                                    ↓
                                  Domain is the core with ZERO outward dependencies
```

## File Structure

```
examples/simple-hexagonal/
├── .stricture/
│   └── config.json              # Stricture configuration (hexagonal preset)
├── .eslintrc.js                 # ESLint + Stricture integration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── README.md                    # This file
├── SPEC.md                      # Technical specification
├── src/
│   ├── core/                    # Business logic (no external dependencies)
│   │   ├── domain/
│   │   │   └── user.ts          # User entity with validation logic
│   │   ├── ports/
│   │   │   └── user-repository.ts  # Repository interface (port)
│   │   └── application/
│   │       ├── create-user.ts   # Use case: create a user
│   │       └── list-users.ts    # Use case: list all users
│   └── adapters/                # Infrastructure implementations
│       ├── memory-repository.ts # In-memory repository (adapter)
│       └── cli.ts               # CLI adapter (entry point)
├── index.ts                     # Main entry point
└── examples/
    └── violation.example.ts     # Example of architectural violations (educational)
```

## The Four Layers

### Domain Layer (`src/core/domain/`)

**Purpose:** Pure business logic with absolutely no dependencies on infrastructure.

**In this example:** The `User` entity with email and name validation.

**Rules:**
- ❌ Cannot import from ports, application, or adapters
- ❌ Cannot import external libraries (except TypeScript built-ins)
- ✅ Can only import other domain entities

**Code example** from `src/core/domain/user.ts:11`:
```typescript
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    // Business rule: Email must be valid
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Business rule: Name cannot be empty
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty')
    }
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.')
  }
}
```

**Key principle:** The domain layer knows nothing about databases, HTTP, CLI, or any infrastructure. It's pure business logic.

### Ports Layer (`src/core/ports/`)

**Purpose:** Define interfaces (contracts) for external interactions. These are the "ports" in hexagonal architecture.

**In this example:** The `UserRepository` interface that defines how to persist users.

**Rules:**
- ✅ Can import from domain (to use domain types in interfaces)
- ❌ Cannot import from application or adapters

**Code example** from `src/core/ports/user-repository.ts:3`:
```typescript
import { User } from '../domain/user'

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
```

**Key principle:** Ports define WHAT operations are needed, not HOW they're implemented. The adapter layer provides the HOW.

### Application Layer (`src/core/application/`)

**Purpose:** Implement use cases that orchestrate domain entities and port interfaces.

**In this example:** `CreateUserUseCase` and `ListUsersUseCase` that coordinate user creation and retrieval.

**Rules:**
- ✅ Can import from domain and ports
- ❌ Cannot import from adapters (depends on interfaces, not implementations)

**Code example** from `src/core/application/create-user.ts:13`:
```typescript
import { User } from '../domain/user'
import { UserRepository } from '../ports/user-repository'

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    // Generate unique ID
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
```

**Key principle:** The use case depends on the `UserRepository` interface, not on `MemoryUserRepository` or any concrete implementation. This is **dependency inversion** in action.

### Adapters Layer (`src/adapters/`)

**Purpose:** Provide concrete implementations of ports and adapt external systems to the domain.

**In this example:** `MemoryUserRepository` (implements the repository interface) and `CliAdapter` (terminal interface).

**Rules:**
- ✅ Can import from ports and application
- ✅ Can import from domain when implementing ports
- ✅ Can use external libraries and frameworks

**Code example** from `src/adapters/memory-repository.ts:13`:
```typescript
import { User } from '../core/domain/user'
import { UserRepository } from '../core/ports/user-repository'

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
```

**Key principle:** Adapters implement the port interfaces. You could swap `MemoryUserRepository` with `PostgresUserRepository` or `MongoUserRepository` without changing any code in the domain, ports, or application layers.

## Installation

```bash
# From repository root
cd examples/simple-hexagonal

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Usage

### Create a User

```bash
node dist/index.js create "John Doe" "john@example.com"
```

**Expected output:**
```
✅ User created successfully!
ID: user_abc123def
Name: John Doe
Email: john@example.com
```

### List All Users

```bash
node dist/index.js list
```

**Expected output:**
```
📋 Users (1):
- John Doe (john@example.com)
```

### Validate Architecture

Check that all architectural boundaries are respected:

```bash
npm run lint
```

**Expected output (if no violations):**
```
✅ All files pass architectural boundaries!
```

### Type Check

Ensure TypeScript types are correct:

```bash
npm run type-check
```

## Stricture Configuration

The `.stricture/config.json` file defines the architectural boundaries and rules:

```json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [
    {
      "name": "domain",
      "pattern": "src/core/domain/**",
      "mode": "file",
      "tags": ["core", "domain"]
    },
    {
      "name": "ports",
      "pattern": "src/core/ports/**",
      "mode": "file",
      "tags": ["core", "ports"]
    },
    {
      "name": "application",
      "pattern": "src/core/application/**",
      "mode": "file",
      "tags": ["core", "application"]
    },
    {
      "name": "adapters",
      "pattern": "src/adapters/**",
      "mode": "file",
      "tags": ["adapters"]
    }
  ],
  "rules": [
    {
      "id": "domain-isolation",
      "from": { "tag": "domain" },
      "to": { "tag": "*" },
      "allowed": false
    }
    // ... other rules
  ]
}
```

**What this configuration does:**

- **Uses the `@stricture/hexagonal` preset** which provides pre-configured boundaries and rules for hexagonal architecture
- **Defines four boundaries** using glob patterns to match files in each layer
- **Enforces rules** like `domain-isolation` which prevents the domain from importing anything from other layers
- **Integrates with ESLint** to provide real-time feedback in your editor

## Try Breaking the Architecture

Want to see Stricture in action? Let's try breaking the architecture!

### Example 1: Domain Importing Adapter (❌ VIOLATION)

Edit `src/core/domain/user.ts` and add this import:

```typescript
// ❌ BAD - Domain importing adapter
import { MemoryUserRepository } from '../../adapters/memory-repository'

export class User {
  // Domain should never know about infrastructure!
  private repo = new MemoryUserRepository()  // ❌ VIOLATION!
  // ...
}
```

**Run:** `npm run lint`

**Output:**
```
src/core/domain/user.ts
  3:1  error  Domain layer cannot import from adapters
              Domain must remain pure - no external dependencies
              @stricture/enforce-boundaries

❌ 1 error
```

### Example 2: Application Importing Concrete Adapter (❌ VIOLATION)

Edit `src/core/application/create-user.ts`:

```typescript
// ❌ BAD - Application importing concrete implementation
import { MemoryUserRepository } from '../../adapters/memory-repository'

export class CreateUserUseCase {
  // Should depend on interface, not implementation!
  private repo = new MemoryUserRepository()  // ❌ VIOLATION!
  // ...
}
```

**Run:** `npm run lint`

**Output:**
```
src/core/application/create-user.ts
  3:1  error  Application layer cannot import adapters directly
              Application layer should depend on port interfaces, not concrete adapter implementations
              @stricture/enforce-boundaries

❌ 1 error
```

### ✅ The Correct Way

```typescript
// ✅ GOOD - Application depends on interface
import { UserRepository } from '../ports/user-repository'

export class CreateUserUseCase {
  // Dependency injection - receives interface
  constructor(private readonly repository: UserRepository) {}
  // ...
}
```

## What Makes This Hexagonal?

This example demonstrates the core principles of hexagonal architecture:

### 1. Dependency Inversion

The application layer depends on the `UserRepository` port (interface), not on the `MemoryUserRepository` adapter (concrete implementation). This is the **Dependency Inversion Principle** in action.

```typescript
// Application layer depends on abstraction
constructor(private readonly userRepository: UserRepository) {}
```

### 2. Domain Isolation

The domain layer has **zero external dependencies**. It doesn't import from any other layer or use any external libraries. This keeps business logic pure and testable.

```typescript
// Domain layer - completely isolated
export class User {
  // No imports from infrastructure!
  // Pure business logic
}
```

### 3. Testability

You can easily swap `MemoryUserRepository` with a `MockUserRepository` for testing without changing any code in the domain or application layers:

```typescript
// In tests
const mockRepo = new MockUserRepository()
const useCase = new CreateUserUseCase(mockRepo)
```

### 4. Flexibility

Want to replace in-memory storage with PostgreSQL? Just create a `PostgresUserRepository` that implements the `UserRepository` interface. The domain and application layers don't need to change:

```typescript
// New adapter - no changes to domain/application!
export class PostgresUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // PostgreSQL implementation
  }
  // ...
}
```

## Learning More

### Stricture Documentation
- [Main Stricture Documentation](../../README.md)
- [Hexagonal Preset Documentation](../../packages/hexagonal/README.md)
- [ESLint Plugin Documentation](../../packages/eslint-plugin/README.md)

### Hexagonal Architecture
- [Original article by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Ports and Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)

### More Complex Examples
- [Next.js Hexagonal Example](../nextjs-hexagonal/) - More complex with HTTP API
- [NestJS Layered Example](../nestjs-layered/) - Different architecture pattern

## Troubleshooting

### ESLint Not Catching Violations

**Problem:** You violate a boundary but `npm run lint` doesn't report it.

**Solution:** Check your `.eslintrc.js` configuration. Make sure:
1. The `@stricture` plugin is listed in `plugins`
2. The `@stricture/enforce-boundaries` rule is set to `'error'`
3. You have a valid `.stricture/config.json` file

### Import Errors

**Problem:** TypeScript reports "Cannot find module" errors.

**Solution:**
1. Run `npm install` from the repository root (if using workspace)
2. Run `npm install` from the `examples/simple-hexagonal` directory
3. Ensure `tsconfig.json` paths are correct

### TypeScript Compilation Errors

**Problem:** `npm run build` fails with TypeScript errors.

**Solution:**
1. Ensure `tsconfig.json` is properly configured
2. Check that all imports use correct paths (relative imports)
3. Run `npm run type-check` to see detailed error messages

### Application Doesn't Run

**Problem:** `node dist/index.js` fails or shows "command not found".

**Solution:**
1. Make sure you've run `npm run build` first
2. Check that the `dist/` directory exists and contains compiled JavaScript
3. For development, use `npm run dev` instead (uses ts-node)

## Contributing

This is an example project demonstrating Stricture usage. For contributions to Stricture itself, please see the main repository README.

## License

MIT

---

**Next Steps:**
1. Read [SPEC.md](./SPEC.md) for detailed technical specifications
2. Try creating your own use cases (update user, delete user)
3. Implement a different adapter (file system storage, SQLite database)
4. Check out more complex examples in the `examples/` directory
