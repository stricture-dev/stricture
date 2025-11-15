import type { Product } from '../domain/product'
import type { ProductRepository } from '../ports/product-repository'

/**
 * GetProductsUseCase - Application layer use case for retrieving all products
 *
 * This is the "application" layer in hexagonal architecture:
 * - Orchestrates domain entities and port interfaces
 * - Contains use case / business workflow logic
 * - Depends on ports (interfaces), not adapters (implementations)
 * - Stateless - dependencies are injected via constructor
 *
 * Use cases represent the "what" of the application:
 * - What can users do with the system?
 * - What workflows are supported?
 *
 * In this case: "As a user, I want to browse all available products"
 */
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Execute the use case: retrieve all products from the repository
   *
   * @returns Array of all products in the catalog
   */
  async execute(): Promise<Product[]> {
    // Delegate to the repository port
    // The application layer doesn't know or care if this is:
    // - In-memory storage
    // - PostgreSQL
    // - MongoDB
    // - External API
    // It just knows there's a ProductRepository that can find products
    return await this.productRepository.findAll()
  }
}
