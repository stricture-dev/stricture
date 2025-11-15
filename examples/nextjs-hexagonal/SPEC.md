# Next.js Hexagonal Example - Technical Specification

## Overview

This example demonstrates Hexagonal Architecture in a Next.js 14 (App Router) application, enforced by Stricture. It's designed to be simple and educational, showing the core hexagonal principles without unnecessary complexity.

## Architecture Pattern

Hexagonal Architecture (Ports & Adapters) with the following layers:

1. **Domain Layer** (`src/core/domain/`) - Pure business logic, zero dependencies
2. **Ports Layer** (`src/core/ports/`) - Interfaces defining contracts
3. **Application Layer** (`src/core/application/`) - Use case orchestration
4. **Driving Adapters** (`src/adapters/driving/`) - Entry points (API routes, Server Components)
5. **Driven Adapters** (`src/adapters/driven/`) - Infrastructure (repositories, external services)

## Domain Model

### Product Entity

```typescript
class Product {
  id: string
  name: string
  price: number
  description: string
  inStock: boolean
}
```

**Business Rules:**
- Price must be positive
- Name cannot be empty
- Description has max length of 500 characters

## Ports

### ProductRepository Port

```typescript
interface ProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string): Promise<Product | null>
}
```

This port defines the contract for product persistence without specifying implementation details.

## Use Cases

### 1. GetProductsUseCase

**Purpose:** Retrieve all products

**Implementation:**
```typescript
class GetProductsUseCase {
  constructor(private productRepository: ProductRepository)

  async execute(): Promise<Product[]> {
    return await this.productRepository.findAll()
  }
}
```

### 2. GetProductByIdUseCase

**Purpose:** Retrieve a single product by ID

**Implementation:**
```typescript
class GetProductByIdUseCase {
  constructor(private productRepository: ProductRepository)

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  }
}
```

## Adapters

### Driven Adapters (Passive/Secondary)

#### MemoryProductRepository

- Implements `ProductRepository` port
- In-memory storage using Map
- Pre-populated with sample products
- Can be swapped with PostgresRepository, MongoRepository, etc. without changing application layer

### Driving Adapters (Active/Primary)

#### API Route Handler (`app/api/products/route.ts`)

- Next.js App Router API route
- Receives HTTP requests
- Calls `GetProductsUseCase`
- Returns JSON response

#### Server Component (`app/products/page.tsx`)

- Next.js Server Component
- Calls `GetProductsUseCase` directly
- Renders product list
- Demonstrates server-side rendering with hexagonal architecture

## Dependency Injection

### Composition Root (`app/di-container.ts`)

The composition root is the ONLY place that knows about concrete implementations:

```typescript
// 1. Create driven adapters
const productRepository = new MemoryProductRepository()

// 2. Create use cases
const getProductsUseCase = new GetProductsUseCase(productRepository)
const getProductByIdUseCase = new GetProductByIdUseCase(productRepository)

// 3. Export for driving adapters to use
export { getProductsUseCase, getProductByIdUseCase }
```

**Key Principles:**
- Driving adapters receive use cases via imports from composition root
- Driven adapters are instantiated and injected into use cases
- No adapter knows about specific implementations of other adapters

## Stricture Configuration

### Configuration File (`.stricture/config.json`)

```json
{
  "preset": "@stricture/hexagonal"
}
```

**Zero overrides** - The preset works out-of-the-box with the standard folder structure.

### Enforced Boundaries

The hexagonal preset enforces these architectural rules:

1. **Domain isolation:** Domain cannot import anything (pure business logic)
2. **Domain self-imports:** Domain can import other domain files
3. **Ports to domain:** Ports can use domain types in their interfaces
4. **Application orchestration:** Application imports domain and ports, not adapters
5. **Driving to application:** Driving adapters call use cases, cannot import domain directly
6. **Driven implements ports:** Driven adapters implement port interfaces
7. **Driven to domain:** Driven adapters can import domain types (for repository implementations)
8. **Adapter independence:** Adapters cannot import each other

## File Structure

```
examples/nextjs-hexagonal/
├── .stricture/
│   └── config.json                    # Stricture configuration (hexagonal preset)
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   └── product.ts             # Product entity with business rules
│   │   ├── ports/
│   │   │   └── product-repository.ts  # Repository interface
│   │   └── application/
│   │       ├── get-products.ts        # GetProductsUseCase
│   │       └── get-product-by-id.ts   # GetProductByIdUseCase
│   └── adapters/
│       ├── driving/
│       │   └── (Next.js routes & components use cases via DI)
│       └── driven/
│           └── memory-repository.ts   # In-memory ProductRepository implementation
├── app/
│   ├── di-container.ts                # Composition root (dependency injection)
│   ├── api/
│   │   └── products/
│   │       ├── route.ts               # API route handler (driving adapter)
│   │       └── [id]/route.ts          # Single product API route
│   └── products/
│       ├── page.tsx                   # Server Component (driving adapter)
│       └── [id]/page.tsx              # Product detail page
├── tests/
│   ├── domain/
│   │   └── product.test.ts            # Domain entity tests
│   ├── application/
│   │   ├── get-products.test.ts       # Use case tests (with mocks)
│   │   └── get-product-by-id.test.ts
│   └── adapters/
│       └── memory-repository.test.ts  # Adapter tests
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## Testing Strategy

### Unit Tests - Domain Layer

Test business rules in isolation:
- Valid product creation
- Price validation (must be positive)
- Name validation (cannot be empty)
- Description length validation

### Integration Tests - Application Layer

Test use cases with mock repositories:
- GetProductsUseCase returns all products
- GetProductByIdUseCase returns correct product
- GetProductByIdUseCase throws when product not found
- Use cases work with different repository implementations

### Adapter Tests

Test adapter implementations:
- MemoryProductRepository correctly stores/retrieves products
- API routes return correct JSON responses
- Server Components render without errors

## Benefits Demonstrated

1. **Testability:** Use cases can be tested with mock repositories
2. **Flexibility:** Swap MemoryRepository for PostgresRepository without touching application layer
3. **Clear boundaries:** Stricture enforces architectural rules at build/lint time
4. **Framework independence:** Core business logic has no Next.js dependencies
5. **Dependency inversion:** Application depends on ports (interfaces), not implementations

## Next.js Integration Points

### Server Components as Driving Adapters

```typescript
import { getProductsUseCase } from '../di-container'

export default async function ProductsPage() {
  const products = await getProductsUseCase.execute()
  return <div>{/* render products */}</div>
}
```

Server Components can directly call use cases because they run on the server.

### API Routes as Driving Adapters

```typescript
import { getProductsUseCase } from '../../di-container'

export async function GET() {
  const products = await getProductsUseCase.execute()
  return Response.json(products)
}
```

API routes act as HTTP adapters, transforming HTTP requests into use case calls.

## Key Architectural Decisions

### Why In-Memory Repository?

This is an educational example. Using an in-memory repository:
- Keeps the example runnable without external dependencies
- Demonstrates that the repository is swappable
- Focuses on architecture, not database setup

### Why No Client Components?

This example focuses on server-side hexagonal architecture:
- Server Components call use cases directly
- API routes provide REST endpoints
- Client-side state management is outside the scope

### Why Simple Domain?

A simple Product entity demonstrates:
- Domain validation rules
- Immutability (readonly properties)
- Business logic methods
- Zero external dependencies

Without overwhelming with complex business scenarios.

## Implementation Checklist

- [ ] Domain entities are pure TypeScript with no framework imports
- [ ] Ports are interfaces only, no implementations
- [ ] Application layer depends on ports, not adapters
- [ ] Driving adapters (routes, components) receive use cases via DI
- [ ] Driven adapters implement port interfaces
- [ ] Composition root wires all dependencies
- [ ] Stricture config uses hexagonal preset with no overrides
- [ ] All tests pass
- [ ] Example is runnable with `pnpm dev`
