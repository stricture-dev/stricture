/**
 * Composition Root - Dependency Injection Container
 *
 * This is the ONLY place in the application that knows about concrete implementations.
 * It wires all dependencies together and creates the application's dependency graph.
 *
 * Dependency flow (from infrastructure to application to driving adapters):
 * 1. Driven adapters (infrastructure) - implements ports
 * 2. Use cases - orchestrate domain using port interfaces
 * 3. Driving adapters (entry points) - call use cases
 *
 * Why this pattern:
 * - API routes and pages don't know about MemoryRepository (easy to swap)
 * - Use cases don't know about concrete repository (testable with mocks)
 * - Only this file knows about all concrete classes
 * - Maintains proper dependency inversion (high-level doesn't depend on low-level)
 *
 * To swap the repository implementation:
 * 1. Create a new adapter (e.g., PostgresProductRepository)
 * 2. Change line 28 to: `new PostgresProductRepository()`
 * 3. That's it! No changes needed anywhere else.
 */

import { MemoryProductRepository } from '@/src/adapters/driven/memory-repository'
import { GetProductsUseCase } from '@/src/core/application/get-products'
import { GetProductByIdUseCase } from '@/src/core/application/get-product-by-id'

// 1. Create driven adapters (infrastructure layer)
// This is where we choose our concrete implementation
const productRepository = new MemoryProductRepository()

// 2. Create use cases with their dependencies injected
// Use cases depend on the ProductRepository interface, not the concrete class
export const getProductsUseCase = new GetProductsUseCase(productRepository)
export const getProductByIdUseCase = new GetProductByIdUseCase(productRepository)

// Driving adapters (API routes, Server Components) import these use cases
// They never import the repository directly - maintaining proper layering
