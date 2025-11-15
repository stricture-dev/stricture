import type { Product } from '../domain/product'

/**
 * ProductRepository port - Interface that defines the contract for product persistence
 *
 * This is a "port" in hexagonal architecture:
 * - Defines WHAT operations are needed (not HOW they're implemented)
 * - Uses domain types (Product entity)
 * - Adapters will implement this interface
 * - Application layer depends on this interface, not on concrete implementations
 *
 * This allows us to:
 * - Swap implementations (MemoryRepository → PostgresRepository → MongoRepository)
 * - Test application layer with mock repositories
 * - Keep business logic independent of infrastructure choices
 */
export interface ProductRepository {
  /**
   * Find all products in the catalog
   */
  findAll(): Promise<Product[]>

  /**
   * Find a single product by its unique ID
   * @returns Product if found, null otherwise
   */
  findById(id: string): Promise<Product | null>
}
