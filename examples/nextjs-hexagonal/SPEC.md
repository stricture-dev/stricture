# Next.js Hexagonal Example - Specification

## Overview

Demonstrates a real-world e-commerce application using Next.js with Hexagonal Architecture enforced by Stricture.

## Features

- Product catalog browsing
- Shopping cart management
- Order creation and payment
- User authentication
- Admin dashboard

## Domain Model

- **Product** - id, name, price, description, stock
- **Order** - id, items, total, status, userId
- **User** - id, email, name, orders
- **OrderItem** - productId, quantity, price

## Use Cases

1. **GetProducts** - List all products
2. **GetProductById** - Get single product
3. **CreateOrder** - Create order from cart
4. **ProcessPayment** - Process payment for order
5. **GetUserOrders** - Get user's order history

## Adapters

- **Prisma** - Database adapter (PostgreSQL)
- **Stripe** - Payment service adapter
- **Next.js API Routes** - HTTP adapter
- **Server Components** - UI adapter

## Testing

- Unit tests for domain logic
- Integration tests for use cases (with mock adapters)
- E2E tests for full flows

## Future Enhancements

- Event sourcing for orders
- CQRS pattern
- Multiple payment adapters
