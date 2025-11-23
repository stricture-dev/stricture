import type { ScaffoldingTemplate } from '@stricture/core'

export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/presentation',
      description: 'User interface layer - controllers, views, CLI commands'
    },
    {
      path: 'src/presentation/http',
      description: 'HTTP controllers and routes'
    },
    {
      path: 'src/presentation/cli',
      description: 'Command-line interface commands'
    },
    {
      path: 'src/presentation/graphql',
      description: 'GraphQL resolvers and schema'
    },
    {
      path: 'src/application',
      description: 'Application layer - use cases and services'
    },
    {
      path: 'src/application/use-cases',
      description: 'Application use cases and business workflows'
    },
    {
      path: 'src/domain',
      description: 'Domain layer - business logic and entities'
    },
    {
      path: 'src/domain/entities',
      description: 'Domain entities with business rules'
    },
    {
      path: 'src/domain/services',
      description: 'Domain services for complex business logic'
    },
    {
      path: 'src/domain/value-objects',
      description: 'Value objects (objects without identity)'
    },
    {
      path: 'src/infrastructure',
      description: 'Infrastructure layer - data access and external systems'
    },
    {
      path: 'src/infrastructure/repositories',
      description: 'Repository implementations for data persistence'
    },
    {
      path: 'src/infrastructure/external',
      description: 'External API clients and integrations'
    },
    {
      path: 'src/infrastructure/database',
      description: 'Database configuration and migrations'
    }
  ],
  files: [
    {
      path: 'src/presentation/README.md',
      description: 'Presentation layer documentation',
      content: `# Presentation Layer

The **presentation layer** is the topmost layer that handles user interaction.

## Responsibilities

- Receive user input (HTTP requests, CLI commands, GraphQL queries)
- Validate input format
- Call application layer use cases
- Format responses for users
- Handle authentication/authorization

## What Goes Here

- **HTTP Controllers**: Express/Fastify route handlers
- **GraphQL Resolvers**: GraphQL query/mutation resolvers
- **CLI Commands**: Command-line interface handlers
- **View Models**: Data structures for presentation
- **DTOs**: Data transfer objects for API requests/responses

## Dependencies

The presentation layer CAN import from:
- ✅ Application layer (to call use cases)
- ✅ Domain layer (to use domain types)
- ✅ Infrastructure layer (for dependency injection)
- ✅ External libraries (UI frameworks, validation)

The presentation layer CANNOT import from:
- ❌ Nothing (it's the topmost layer)

## Examples

\`\`\`typescript
// http/user-controller.ts
import { CreateUserUseCase } from '../../application/use-cases/create-user'
import { User } from '../../domain/entities/user'

export class UserController {
  constructor(private createUser: CreateUserUseCase) {}
  
  async create(req: Request, res: Response) {
    const user = await this.createUser.execute(req.body)
    res.json({ user })
  }
}
\`\`\`

## Layer Dependencies

\`\`\`
Presentation (YOU ARE HERE)
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
\`\`\`
`
    },
    {
      path: 'src/application/README.md',
      description: 'Application layer documentation',
      content: `# Application Layer

The **application layer** orchestrates use cases and business workflows.

## Responsibilities

- Implement use cases (application-specific business rules)
- Orchestrate domain objects to fulfill use cases
- Coordinate transactions
- Call infrastructure services (repositories, external APIs)
- Handle application-level validation

## What Goes Here

- **Use Cases**: Classes that implement specific application workflows
- **Application Services**: Coordinate multiple use cases
- **DTOs**: Data transfer objects for use case inputs/outputs
- **Interfaces**: Define contracts for infrastructure dependencies

## Dependencies

The application layer CAN import from:
- ✅ Domain layer (entities, value objects, domain services)
- ✅ Infrastructure layer (repository interfaces, service interfaces)
- ✅ External libraries (utilities, validation libraries)

The application layer CANNOT import from:
- ❌ Presentation layer (no knowledge of HTTP, CLI, or UI)

## Examples

\`\`\`typescript
// use-cases/create-user.ts
import { User } from '../../domain/entities/user'
import { UserRepository } from '../../infrastructure/repositories/user-repository'

export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}
  
  async execute(data: { email: string }): Promise<User> {
    const user = new User(data.email)
    
    if (!user.isValid()) {
      throw new Error('Invalid user')
    }
    
    await this.userRepo.save(user)
    return user
  }
}
\`\`\`

## Layer Dependencies

\`\`\`
Presentation
    ↓
Application (YOU ARE HERE)
    ↓
Domain
    ↓
Infrastructure
\`\`\`
`
    },
    {
      path: 'src/domain/README.md',
      description: 'Domain layer documentation',
      content: `# Domain Layer

The **domain layer** contains the core business logic and rules.

## Responsibilities

- Define business entities with identity
- Implement business rules and invariants
- Define value objects (objects without identity)
- Provide domain services for complex logic
- Define repository interfaces (implemented by infrastructure)

## What Goes Here

- **Entities**: Business objects with identity (User, Order, Product)
- **Value Objects**: Objects defined by their values (Email, Money, Address)
- **Domain Services**: Business logic that doesn't belong to a single entity
- **Repository Interfaces**: Contracts for data access (implemented in infrastructure)
- **Domain Events**: Events that represent business occurrences

## Dependencies

The domain layer CAN import from:
- ✅ Infrastructure layer (to define repository interfaces)
- ✅ External libraries (minimal - pure logic libraries only)

The domain layer CANNOT import from:
- ❌ Presentation layer (no knowledge of UI)
- ❌ Application layer (no knowledge of use cases)

## Examples

\`\`\`typescript
// entities/user.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}
  
  isValid(): boolean {
    return this.email.includes('@')
  }
  
  changeEmail(newEmail: string): User {
    return new User(this.id, newEmail)
  }
}
\`\`\`

\`\`\`typescript
// value-objects/email.ts
export class Email {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Email {
    if (!value.includes('@')) {
      throw new Error('Invalid email')
    }
    return new Email(value)
  }
  
  equals(other: Email): boolean {
    return this.value === other.value
  }
}
\`\`\`

## Layer Dependencies

\`\`\`
Presentation
    ↓
Application
    ↓
Domain (YOU ARE HERE)
    ↓
Infrastructure
\`\`\`
`
    },
    {
      path: 'src/infrastructure/README.md',
      description: 'Infrastructure layer documentation',
      content: `# Infrastructure Layer

The **infrastructure layer** provides implementations for data access and external system integration.

## Responsibilities

- Implement repository interfaces (data persistence)
- Integrate with external APIs and services
- Provide database configuration and migrations
- Implement caching strategies
- Handle file system operations
- Manage messaging and event publishing

## What Goes Here

- **Repository Implementations**: Concrete classes that implement domain repository interfaces
- **Database Clients**: PostgreSQL, MongoDB, Redis connections
- **External API Clients**: HTTP clients for third-party APIs
- **File Storage**: S3, local file system implementations
- **Message Queues**: RabbitMQ, Kafka producers/consumers
- **ORMs/Query Builders**: Prisma, TypeORM, Knex configurations

## Dependencies

The infrastructure layer CAN import from:
- ✅ External libraries (database drivers, HTTP clients, AWS SDK)

The infrastructure layer CANNOT import from:
- ❌ Presentation layer (no knowledge of controllers or UI)
- ❌ Application layer (no knowledge of use cases)
- ❌ Domain layer (no business logic, only interfaces/types)

## Examples

\`\`\`typescript
// repositories/user-repository.ts
import { User } from '../../domain/entities/user'
import { Database } from 'some-db-library'

export class UserRepository {
  constructor(private db: Database) {}
  
  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id])
    if (!row) return null
    return new User(row.id, row.email)
  }
  
  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET email = $2',
      [user.id, user.email]
    )
  }
}
\`\`\`

\`\`\`typescript
// external/stripe-client.ts
import Stripe from 'stripe'

export class StripeClient {
  private stripe: Stripe
  
  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' })
  }
  
  async createPayment(amount: number): Promise<string> {
    const payment = await this.stripe.paymentIntents.create({ amount })
    return payment.id
  }
}
\`\`\`

## Layer Dependencies

\`\`\`
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure (YOU ARE HERE - Bottom Layer)
\`\`\`
`
    }
  ]
}
