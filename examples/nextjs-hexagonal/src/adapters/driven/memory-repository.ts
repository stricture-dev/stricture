import { Product } from '../../core/domain/product'
import type { ProductRepository } from '../../core/ports/product-repository'

/**
 * In-memory implementation of ProductRepository
 *
 * This is a "driven adapter" (secondary/passive) in hexagonal architecture:
 * - Implements a port interface (ProductRepository)
 * - Handles infrastructure concerns (data storage)
 * - Can be swapped with other implementations without changing application layer
 * - Domain and application layers don't know about this implementation
 *
 * This adapter uses an in-memory Map for simplicity, demonstrating that:
 * - The repository is swappable (could be PostgreSQL, MongoDB, API, etc.)
 * - The example runs without external dependencies
 * - Testing is easier with predictable, isolated data
 *
 * In a real application, you might have:
 * - PostgresProductRepository
 * - MongoProductRepository
 * - RestApiProductRepository
 * All implementing the same ProductRepository interface.
 */
export class MemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map()

  constructor() {
    // Pre-populate with sample products for demonstration
    this.seed()
  }

  async findAll(): Promise<Product[]> {
    // Return all products as an array
    return Array.from(this.products.values())
  }

  async findById(id: string): Promise<Product | null> {
    // Return the product if found, otherwise null
    return this.products.get(id) || null
  }

  /**
   * Seed the repository with sample products
   * In a real application, this data would come from a database
   */
  private seed(): void {
    const sampleProducts = [
      new Product(
        '1',
        'Laptop',
        999.99,
        'High-performance laptop with 16GB RAM and 512GB SSD. Perfect for development and creative work.',
        true
      ),
      new Product(
        '2',
        'Wireless Mouse',
        29.99,
        'Ergonomic wireless mouse with precision tracking and long battery life.',
        true
      ),
      new Product(
        '3',
        'Mechanical Keyboard',
        79.99,
        'RGB mechanical keyboard with Cherry MX switches. Customizable lighting and macro keys.',
        false
      ),
      new Product(
        '4',
        'USB-C Hub',
        49.99,
        'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader. Ideal for laptops.',
        true
      ),
      new Product(
        '5',
        'Monitor',
        299.99,
        '27-inch 4K monitor with IPS panel and HDR support. Great for productivity and media consumption.',
        true
      ),
      new Product(
        '6',
        'Webcam',
        89.99,
        '1080p webcam with auto-focus and built-in microphone. Perfect for video calls and streaming.',
        true
      ),
      new Product(
        '7',
        'Headphones',
        149.99,
        'Noise-canceling over-ear headphones with premium sound quality and comfortable design.',
        false
      ),
      new Product(
        '8',
        'Desk Lamp',
        39.99,
        'LED desk lamp with adjustable brightness and color temperature. USB charging port included.',
        true
      )
    ]

    // Add each product to the Map
    sampleProducts.forEach(product => {
      this.products.set(product.id, product)
    })
  }
}
