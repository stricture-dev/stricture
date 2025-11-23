import type { ScaffoldingTemplate } from '@stricture/core'

/**
 * Clean Architecture scaffolding template
 *
 * Provides directory structure and example files for setting up
 * a Clean Architecture project following Uncle Bob's concentric circles.
 */
export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/entities',
      description: 'Enterprise business rules - entities and domain logic'
    },
    {
      path: 'src/entities/value-objects',
      description: 'Immutable value objects'
    },
    {
      path: 'src/use-cases',
      description: 'Application business rules - use case interactors'
    },
    {
      path: 'src/use-cases/input-ports',
      description: 'Input port interfaces for use cases'
    },
    {
      path: 'src/use-cases/output-ports',
      description: 'Output port interfaces for presenters'
    },
    {
      path: 'src/interface-adapters',
      description: 'Interface adapters - controllers, gateways, presenters'
    },
    {
      path: 'src/interface-adapters/controllers',
      description: 'Controllers that invoke use cases'
    },
    {
      path: 'src/interface-adapters/presenters',
      description: 'Presenters that format output'
    },
    {
      path: 'src/interface-adapters/gateways',
      description: 'Gateways that implement data access interfaces'
    },
    {
      path: 'src/frameworks-drivers',
      description: 'Frameworks and drivers - web, database, external interfaces'
    },
    {
      path: 'src/frameworks-drivers/web',
      description: 'Web framework configuration and routing'
    },
    {
      path: 'src/frameworks-drivers/database',
      description: 'Database connections and ORM setup'
    },
    {
      path: 'src/frameworks-drivers/cli',
      description: 'Command-line interface'
    }
  ],
  files: [
    {
      path: 'src/entities/README.md',
      content: `# Entities Layer (Layer 0 - Innermost)

Enterprise business rules - the core domain logic.

## What Belongs Here

✅ **Enterprise-wide business rules**
- Domain entities with identity
- Value objects (immutable)
- Domain services
- Business validations

## The Dependency Rule

❌ **Entities CANNOT depend on:**
- Use cases
- Interface adapters
- Frameworks & drivers
- External libraries

✅ **Entities CAN depend on:**
- Other entities
- Value objects

## Guidelines

1. **Pure business logic** - No infrastructure concerns
2. **Framework-independent** - No framework imports
3. **No outer layer dependencies** - Entities are the core
4. **Highly reusable** - Can be used in multiple applications

## Example

\`\`\`typescript
// ✅ Good - Pure entity
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly total: Money
  ) {
    this.validate()
  }

  private validate(): void {
    if (this.items.length === 0) {
      throw new Error('Order must have at least one item')
    }
  }

  addItem(item: OrderItem): Order {
    return new Order(
      this.id,
      this.customerId,
      [...this.items, item],
      this.total.add(item.price)
    )
  }
}
\`\`\`

\`\`\`typescript
// ❌ Bad - Entity depending on outer layer
import { OrderRepository } from '../use-cases/order-repository'

export class Order {
  async save(): Promise<void> {
    // Entity should not know about persistence!
    await new OrderRepository().save(this)
  }
}
\`\`\`
`,
      description: 'Entities layer documentation'
    },
    {
      path: 'src/use-cases/README.md',
      content: `# Use Cases Layer (Layer 1)

Application-specific business rules.

## What Belongs Here

✅ **Application business rules**
- Use case interactors
- Input port interfaces
- Output port interfaces
- Data access interfaces (gateways)

## The Dependency Rule

❌ **Use cases CANNOT depend on:**
- Interface adapters
- Frameworks & drivers

✅ **Use cases CAN depend on:**
- Entities
- Other use cases
- External utilities (if needed)

## Guidelines

1. **One use case = one business operation**
2. **Define input/output ports** - Interfaces for adapters
3. **Orchestrate entities** - Use entities to perform business logic
4. **Framework-independent** - No framework-specific code

## Example

\`\`\`typescript
// ✅ Good - Pure use case with ports
import { Order } from '../entities/order'

// Input port
export interface CreateOrderInput {
  customerId: string
  items: { productId: string; quantity: number }[]
}

// Output port
export interface OrderOutput {
  present(order: Order): void
}

// Gateway interface (data access)
export interface OrderGateway {
  save(order: Order): Promise<void>
  findById(id: string): Promise<Order | null>
}

// Use case interactor
export class CreateOrderUseCase {
  constructor(
    private readonly orderGateway: OrderGateway,
    private readonly output: OrderOutput
  ) {}

  async execute(input: CreateOrderInput): Promise<void> {
    // Create entity
    const order = new Order(
      this.generateId(),
      input.customerId,
      input.items,
      this.calculateTotal(input.items)
    )

    // Save through gateway
    await this.orderGateway.save(order)

    // Present through output port
    this.output.present(order)
  }
}
\`\`\`
`,
      description: 'Use cases layer documentation'
    },
    {
      path: 'src/interface-adapters/README.md',
      content: `# Interface Adapters Layer (Layer 2)

Adapters that convert data between use cases and external agencies.

## What Belongs Here

✅ **Interface adapters**
- Controllers (invoke use cases)
- Presenters (implement output ports)
- Gateways (implement data access interfaces)
- View models and DTOs

## The Dependency Rule

❌ **Interface adapters SHOULD NOT depend on:**
- Frameworks & drivers (kept in outer layer)

✅ **Interface adapters CAN depend on:**
- Use cases
- Entities
- External utilities

## Guidelines

1. **Convert data formats** - Between web/external and internal formats
2. **Implement ports** - Realize interfaces defined in use cases
3. **No business logic** - Only conversion and delegation
4. **Framework-agnostic** - No framework details here

## Example

\`\`\`typescript
// ✅ Good - Controller that invokes use case
import { CreateOrderUseCase, CreateOrderInput } from '../../use-cases/create-order'

export class OrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async handleCreateOrder(request: HttpRequest): Promise<HttpResponse> {
    // Convert HTTP request to use case input
    const input: CreateOrderInput = {
      customerId: request.body.customerId,
      items: request.body.items
    }

    // Invoke use case
    await this.createOrder.execute(input)

    return { status: 201, body: { message: 'Order created' } }
  }
}
\`\`\`

\`\`\`typescript
// ✅ Good - Gateway implementing use case interface
import { OrderGateway } from '../../use-cases/create-order'
import { Order } from '../../entities/order'

export class InMemoryOrderGateway implements OrderGateway {
  private orders = new Map<string, Order>()

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order)
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null
  }
}
\`\`\`
`,
      description: 'Interface adapters layer documentation'
    },
    {
      path: 'src/frameworks-drivers/README.md',
      content: `# Frameworks & Drivers Layer (Layer 3 - Outermost)

External agencies like web frameworks, databases, and UI.

## What Belongs Here

✅ **Frameworks and tools**
- Web framework setup (Express, Fastify, etc.)
- Database connections and ORMs
- CLI setup
- External API clients
- Logging configuration
- Dependency injection container

## The Dependency Rule

✅ **Frameworks CAN depend on:**
- Everything! (This is the outermost layer)
- Interface adapters
- Use cases
- Entities

## Guidelines

1. **Wire everything together** - Dependency injection happens here
2. **Framework-specific code** - All framework details stay here
3. **Main/composition root** - Application entry point
4. **Keep thin** - Just wiring, no business logic

## Example

\`\`\`typescript
// ✅ Good - Framework layer wiring everything together
import express from 'express'
import { CreateOrderUseCase } from '../use-cases/create-order'
import { OrderController } from '../interface-adapters/controllers/order-controller'
import { InMemoryOrderGateway } from '../interface-adapters/gateways/in-memory-order-gateway'
import { ConsoleOrderPresenter } from '../interface-adapters/presenters/console-order-presenter'

// Create infrastructure
const app = express()
app.use(express.json())

// Wire dependencies (composition root)
const orderGateway = new InMemoryOrderGateway()
const orderPresenter = new ConsoleOrderPresenter()
const createOrderUseCase = new CreateOrderUseCase(orderGateway, orderPresenter)
const orderController = new OrderController(createOrderUseCase)

// Setup routes
app.post('/orders', (req, res) => {
  orderController.handleCreateOrder({ body: req.body })
    .then(response => res.status(response.status).json(response.body))
})

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
\`\`\`
`,
      description: 'Frameworks & drivers layer documentation'
    }
  ]
}
