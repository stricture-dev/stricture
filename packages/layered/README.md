# @stricture/layered

Classic Layered Architecture (N-tier) preset for Stricture. Enforces strict top-to-bottom dependencies between horizontal layers.

## What is Layered Architecture?

Layered Architecture organizes code into horizontal layers, where each layer can only depend on layers below it:

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'hsl(210, 100%, 85%)','primaryBorderColor':'hsl(210, 100%, 70%)','secondaryColor':'hsl(180, 100%, 85%)','secondaryBorderColor':'hsl(180, 100%, 70%)','tertiaryColor':'hsl(150, 100%, 85%)','tertiaryBorderColor':'hsl(150, 100%, 70%)','quaternaryColor':'hsl(120, 100%, 85%)','quaternaryBorderColor':'hsl(120, 100%, 70%)'}}}%%
graph TB
    P["Presentation Layer<br/>Controllers, UI, CLI"]
    A["Application Layer<br/>Use Cases, Services"]
    D["Domain Layer<br/>Business Logic, Entities"]
    I["Infrastructure Layer<br/>Database, External APIs"]
    
    P --> A
    P --> D
    P --> I
    A --> D
    A --> I
    D --> I
    
    style P fill:hsl(210, 100%, 85%)
    style A fill:hsl(180, 100%, 85%)
    style D fill:hsl(150, 100%, 85%)
    style I fill:hsl(120, 100%, 85%)
```

**Dependencies flow TOP → BOTTOM only**

## Core Principle

**Each layer can only depend on itself or layers below it.**

Lower layers must NEVER import from higher layers, maintaining a clean separation of concerns.

## Installation

```bash
npm install -D @stricture/eslint-plugin
```

Or use the CLI:

```bash
npx stricture init --preset @stricture/layered
```

## Directory Structure

```
src/
├── presentation/       # Top - UI, Controllers, Views, CLI
├── application/        # Use Cases, Application Services
├── domain/            # Business Logic, Entities
└── infrastructure/    # Bottom - Database, External APIs
```

## Layer Responsibilities

### Presentation Layer (Top)

**What**: User interface, HTTP controllers, GraphQL resolvers, CLI commands, views

**Can depend on**: Application, Domain, Infrastructure (for DI), External (UI frameworks)

**Examples**: Express routes, React components, CLI commands

```typescript
// src/presentation/http/user-controller.ts
import { CreateUserUseCase } from '../../application/create-user'
import { User } from '../../domain/user'

export class UserController {
  constructor(private createUser: CreateUserUseCase) {}
  
  async handle(req, res) {
    const user = await this.createUser.execute(req.body)
    res.json(user)
  }
}
```

### Application Layer

**What**: Use cases, application services, orchestration, workflows

**Can depend on**: Domain, Infrastructure (interfaces only), External (utilities)

**Cannot depend on**: Presentation

**Examples**: CreateUserUseCase, OrderProcessor, NotificationService

```typescript
// src/application/create-user.ts
import { User } from '../domain/user'
import { UserRepository } from '../infrastructure/repositories/user-repository'

export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}
  
  async execute(data: { email: string }): Promise<User> {
    const user = new User(data.email)
    await this.userRepo.save(user)
    return user
  }
}
```

### Domain Layer

**What**: Business logic, domain entities, value objects, domain services

**Can depend on**: Infrastructure (interfaces/ports only), External (minimal)

**Cannot depend on**: Presentation, Application

**Examples**: User entity, Order entity, PriceCalculator service

```typescript
// src/domain/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}
  
  isValid(): boolean {
    return this.email.includes('@')
  }
}
```

### Infrastructure Layer (Bottom)

**What**: Database access, external APIs, file system, messaging, persistence

**Can depend on**: External (database drivers, HTTP clients)

**Cannot depend on**: Presentation, Application, Domain (except interfaces)

**Examples**: PostgreSQL repository, REST API client, File storage

```typescript
// src/infrastructure/repositories/user-repository.ts
import { User } from '../../domain/user'
import { Database } from 'some-db-library'

export class UserRepository {
  constructor(private db: Database) {}
  
  async save(user: User): Promise<void> {
    await this.db.insert('users', {
      id: user.id,
      email: user.email
    })
  }
}
```

## Dependency Rules

| From Layer | Can Import | Cannot Import |
|------------|-----------|---------------|
| **Presentation** | Application, Domain, Infrastructure, External | - |
| **Application** | Domain, Infrastructure, External | Presentation |
| **Domain** | Infrastructure (interfaces), External (minimal) | Presentation, Application |
| **Infrastructure** | External | Presentation, Application, Domain |

## Common Violations

### ❌ Domain Importing Application

```typescript
// domain/user.ts
import { CreateUserUseCase } from '../application/create-user'  // WRONG!

export class User {
  // Domain entities should not know about use cases
}
```

**Fix**: Use dependency injection in the Application layer.

### ❌ Infrastructure Importing Domain Logic

```typescript
// infrastructure/user-repository.ts
import { User } from '../domain/user'  // WRONG if importing logic!

// Infrastructure should only reference domain interfaces/types
// Use ports/interfaces to invert dependencies
```

**Fix**: Define repository interfaces in Domain, implement in Infrastructure.

### ❌ Application Importing Presentation

```typescript
// application/create-user.ts
import { UserController } from '../presentation/user-controller'  // WRONG!

// Application should not know about controllers
```

**Fix**: Presentation calls Application, not the other way around.

## When to Use Layered Architecture

**Good for**:
- Traditional web applications
- CRUD-heavy systems
- Teams familiar with MVC/N-tier
- Projects where horizontal slicing makes sense
- Clear separation of UI, business logic, and data access

**Consider alternatives if**:
- You need vertical feature slices (consider feature-based architecture)
- Domain logic is complex (consider Hexagonal or Clean Architecture)
- You need plugin architectures (consider Hexagonal)

## Comparison with Other Architectures

| Architecture | Dependency Direction | Flexibility | Complexity |
|--------------|---------------------|-------------|------------|
| **Layered** | Top → Bottom (strict) | Medium | Low |
| **Hexagonal** | Outside → Inside (via ports) | High | Medium |
| **Clean** | Outside → Inside (concentric) | High | High |

## Advanced Usage

### Custom Configuration

While the preset works zero-config, you can customize:

```json
{
  "preset": "@stricture/layered",
  "rules": [
    {
      "id": "custom-logging",
      "from": { "tag": "*" },
      "to": { "pattern": "src/shared/logging/**" },
      "allowed": true
    }
  ]
}
```

### TypeScript Helpers

```typescript
import type { Entity, Service, Repository } from '@stricture/layered'

// Use provided types for consistency
export class User implements Entity<string> {
  readonly id: string
}

export class CreateUserUseCase implements Service {
  // ...
}
```

## License

MIT
