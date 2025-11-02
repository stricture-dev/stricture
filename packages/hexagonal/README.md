# @stricture/hexagonal

Hexagonal Architecture (Ports & Adapters) preset for Stricture. Enforces clean separation between business logic, ports (interfaces), and adapters (implementations).

## What is Hexagonal Architecture?

Hexagonal Architecture, also known as Ports and Adapters, is a pattern that:

- **Isolates business logic** in the domain layer (the "hexagon")
- **Defines ports** as interfaces for external interactions
- **Implements adapters** that connect ports to external systems
- **Inverts dependencies** so domain doesn't depend on infrastructure

## Architecture Layers

```
┌─────────────────────────────────────┐
│          Adapters (Outside)         │
│  ┌───────────────────────────────┐  │
│  │   Application Layer (Use Cases) │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Domain (Core Logic)   │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    Ports (Interfaces)   │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Installation

```bash
npm install -D @stricture/hexagonal @stricture/eslint-plugin
```

Or use the CLI:

```bash
npx stricture init --preset @stricture/hexagonal
```

## Directory Structure

The preset expects this structure:

```
src/
├── core/
│   ├── domain/           # Pure business logic (entities, value objects)
│   ├── ports/            # Interfaces for external interactions
│   └── application/      # Use cases (orchestrate domain + ports)
└── adapters/             # Implementations of ports
    ├── api/              # HTTP/REST adapters
    ├── database/         # Database adapters
    ├── messaging/        # Message queue adapters
    └── ...
```

## Boundaries

The preset defines these boundaries:

| Boundary | Pattern | Description |
|----------|---------|-------------|
| **domain** | `src/core/domain/**` | Pure business entities and logic |
| **ports** | `src/core/ports/**` | Interface definitions |
| **application** | `src/core/application/**` | Use cases and workflows |
| **adapters** | `src/adapters/**` | Infrastructure implementations |

## Rules

### 1. Domain Isolation

**Domain cannot import anything external.**

```typescript
// ❌ BAD - Domain importing infrastructure
// src/core/domain/user.ts
import { Database } from '../../adapters/database'

// ✅ GOOD - Domain is pure
// src/core/domain/user.ts
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

### 2. Application Layer Rules

**Application can import domain and ports, but not adapters.**

```typescript
// ❌ BAD - Application importing adapter directly
// src/core/application/create-user.ts
import { PostgresUserRepository } from '../../adapters/database'

// ✅ GOOD - Application depends on port interface
// src/core/application/create-user.ts
import { User } from '../domain/user'
import { UserRepository } from '../ports/user-repository'

export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(email: string): Promise<User> {
    const user = new User(generateId(), email)
    await this.userRepo.save(user)
    return user
  }
}
```

### 3. Ports Define Contracts

**Ports are interfaces that adapters implement.**

```typescript
// ✅ GOOD - Port defines contract
// src/core/ports/user-repository.ts
import { User } from '../domain/user'

export interface UserRepository {
  save(user: User): Promise<void>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
}
```

### 4. Adapters Implement Ports

**Adapters implement port interfaces, not the other way around.**

```typescript
// ✅ GOOD - Adapter implements port
// src/adapters/database/postgres-user-repository.ts
import { UserRepository } from '../../core/ports/user-repository'
import { User } from '../../core/domain/user'

export class PostgresUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    await this.db.query('INSERT INTO users ...', [user.id, user.email])
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id])
    return row ? new User(row.id, row.email) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    // ...
  }
}
```

### 5. No Adapter-to-Domain Imports

**Adapters cannot import domain directly, only through ports.**

```typescript
// ❌ BAD - Adapter importing domain
// src/adapters/api/user-controller.ts
import { User } from '../../core/domain/user'

// ✅ GOOD - Adapter uses application layer
// src/adapters/api/user-controller.ts
import { CreateUserUseCase } from '../../core/application/create-user'

export class UserController {
  constructor(private createUser: CreateUserUseCase) {}

  async handleCreateUser(req: Request, res: Response) {
    const user = await this.createUser.execute(req.body.email)
    res.json(user)
  }
}
```

## Configuration

The preset provides this configuration:

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
      "name": "Domain Isolation",
      "severity": "error",
      "from": { "tag": "domain" },
      "to": { "pattern": "**" },
      "allowed": false,
      "message": "Domain layer must remain pure - no external dependencies"
    },
    {
      "id": "application-to-domain-and-ports",
      "name": "Application Layer Dependencies",
      "severity": "error",
      "from": { "tag": "application" },
      "to": { "tag": "adapters" },
      "allowed": false,
      "message": "Application layer can only depend on domain and ports, not adapters"
    },
    {
      "id": "adapters-via-ports",
      "name": "Adapters Through Ports",
      "severity": "error",
      "from": { "tag": "adapters" },
      "to": { "tag": "domain" },
      "allowed": false,
      "message": "Adapters should depend on ports and application layer, not domain directly"
    }
  ]
}
```

## Dependency Flow

```
Adapters → Application → Domain
    ↓           ↓
  Ports ← ← ← ← ←
```

**Allowed**:
- Domain → (nothing)
- Ports → Domain
- Application → Domain, Ports
- Adapters → Ports, Application

**Forbidden**:
- Domain → Anything
- Application → Adapters
- Adapters → Domain

## Examples

### E-commerce Domain

```typescript
// src/core/domain/order.ts
export class Order {
  constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public readonly total: Money
  ) {}

  addItem(item: OrderItem): Order {
    return new Order(
      this.id,
      [...this.items, item],
      this.total.add(item.price)
    )
  }
}

// src/core/ports/order-repository.ts
export interface OrderRepository {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order | null>
}

// src/core/application/create-order.ts
export class CreateOrderUseCase {
  constructor(private orderRepo: OrderRepository) {}

  async execute(items: OrderItem[]): Promise<Order> {
    const order = new Order(generateId(), items, calculateTotal(items))
    await this.orderRepo.save(order)
    return order
  }
}

// src/adapters/database/mongo-order-repository.ts
export class MongoOrderRepository implements OrderRepository {
  async save(order: Order): Promise<void> {
    await this.collection.insertOne({
      _id: order.id,
      items: order.items,
      total: order.total
    })
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: id })
    return doc ? new Order(doc._id, doc.items, doc.total) : null
  }
}
```

## Customization

You can extend the preset in your `.stricture/config.json`:

```json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [
    {
      "name": "shared",
      "pattern": "src/shared/**",
      "mode": "file"
    }
  ],
  "rules": [
    {
      "id": "allow-shared-everywhere",
      "from": { "pattern": "**" },
      "to": { "tag": "shared" },
      "allowed": true,
      "severity": "error"
    }
  ]
}
```

## Benefits

✅ **Testable** - Domain logic is pure and easy to test
✅ **Flexible** - Swap adapters without changing domain
✅ **Maintainable** - Clear boundaries prevent coupling
✅ **Framework-independent** - Domain doesn't depend on frameworks

## Learn More

- [Hexagonal Architecture explained](https://alistair.cockburn.us/hexagonal-architecture/)
- [Example project](https://github.com/stricture-dev/stricture/tree/main/examples/nextjs-hexagonal)
- [Video tutorial](https://stricture.dev/tutorials/hexagonal)

## License

MIT
