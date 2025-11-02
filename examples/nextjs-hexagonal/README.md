# Next.js Hexagonal Architecture Example

Example e-commerce application built with Next.js 14 (App Router) using Hexagonal Architecture, enforced by Stricture.

## Architecture

This example demonstrates:

- **Domain Layer** - Product, Order, User entities
- **Ports** - Repository and service interfaces
- **Application Layer** - Use cases (CreateOrder, GetProducts, etc.)
- **Adapters** - API routes, database, external services

## Structure

```
src/
├── core/
│   ├── domain/           # Business entities
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── user.ts
│   ├── ports/            # Interfaces
│   │   ├── product-repository.ts
│   │   ├── order-repository.ts
│   │   └── payment-service.ts
│   └── application/      # Use cases
│       ├── create-order.ts
│       ├── get-products.ts
│       └── process-payment.ts
├── adapters/
│   ├── database/         # Prisma repositories
│   ├── api/              # External API clients
│   └── stripe/           # Stripe payment adapter
└── app/                  # Next.js App Router
    ├── products/
    ├── cart/
    └── checkout/
```

## Stricture Configuration

See `.stricture/config.json` for the complete boundary configuration.

## Running

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

## Key Learnings

- Domain layer is pure TypeScript with no framework dependencies
- Ports define contracts that adapters implement
- Application layer orchestrates domain and ports
- Next.js components use application layer use cases
- Easy to test (mock ports in tests)
- Easy to swap adapters (e.g., swap Stripe for PayPal)

## License

MIT
