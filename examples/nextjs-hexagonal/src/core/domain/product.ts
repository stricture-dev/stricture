/**
 * Product entity - Pure business logic with no external dependencies
 *
 * This is the heart of hexagonal architecture - domain layer has:
 * - Zero dependencies on infrastructure (no database, HTTP, Next.js, etc.)
 * - Only business rules and validation logic
 * - Immutable data (readonly properties)
 * - Self-contained business methods
 */
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly description: string,
    public readonly inStock: boolean
  ) {
    // Business rule: Price must be positive
    if (price <= 0) {
      throw new Error('Price must be positive')
    }

    // Business rule: Name cannot be empty
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty')
    }

    // Business rule: Description has maximum length
    if (description.length > 500) {
      throw new Error('Description cannot exceed 500 characters')
    }
  }

  /**
   * Business method: Format price for display
   */
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`
  }

  /**
   * Business method: Check if product is available for purchase
   */
  isAvailable(): boolean {
    return this.inStock && this.price > 0
  }

  /**
   * Business method: Get a short description for previews
   */
  getShortDescription(maxLength: number = 100): string {
    if (this.description.length <= maxLength) {
      return this.description
    }
    return this.description.substring(0, maxLength) + '...'
  }
}
