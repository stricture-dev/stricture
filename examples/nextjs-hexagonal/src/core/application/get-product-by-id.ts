import type { Product } from '../domain/product'
import type { ProductRepository } from '../ports/product-repository'

/**
 * GetProductByIdUseCase - Application layer use case for retrieving a single product
 *
 * This use case demonstrates:
 * - Input validation at the application layer
 * - Error handling for business scenarios (product not found)
 * - Delegation to domain and port layers
 *
 * Use case: "As a user, I want to view details of a specific product"
 */
export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Execute the use case: retrieve a product by its ID
   *
   * @param id - The unique identifier of the product
   * @returns The product if found
   * @throws Error if product is not found or if ID is invalid
   */
  async execute(id: string): Promise<Product> {
    // Application-level validation: check input
    if (!id || id.trim().length === 0) {
      throw new Error('Product ID cannot be empty')
    }

    // Delegate to repository to find the product
    const product = await this.productRepository.findById(id)

    // Handle business scenario: product not found
    if (!product) {
      throw new Error(`Product with ID "${id}" not found`)
    }

    return product
  }
}
