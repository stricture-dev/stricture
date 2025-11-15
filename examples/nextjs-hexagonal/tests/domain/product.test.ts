import { describe, it, expect } from 'vitest'
import { Product } from '../../src/core/domain/product'

describe('Product', () => {
  describe('constructor', () => {
    it('should create a valid product with correct data', () => {
      const product = new Product(
        '1',
        'Laptop',
        999.99,
        'High-performance laptop',
        true
      )

      expect(product.id).toBe('1')
      expect(product.name).toBe('Laptop')
      expect(product.price).toBe(999.99)
      expect(product.description).toBe('High-performance laptop')
      expect(product.inStock).toBe(true)
    })

    it('should throw error for negative price', () => {
      expect(() => {
        new Product('1', 'Laptop', -10, 'Description', true)
      }).toThrow('Price must be positive')
    })

    it('should throw error for zero price', () => {
      expect(() => {
        new Product('1', 'Laptop', 0, 'Description', true)
      }).toThrow('Price must be positive')
    })

    it('should throw error for empty name', () => {
      expect(() => {
        new Product('1', '', 100, 'Description', true)
      }).toThrow('Name cannot be empty')
    })

    it('should throw error for whitespace-only name', () => {
      expect(() => {
        new Product('1', '   ', 100, 'Description', true)
      }).toThrow('Name cannot be empty')
    })

    it('should throw error for description exceeding 500 characters', () => {
      const longDescription = 'a'.repeat(501)

      expect(() => {
        new Product('1', 'Laptop', 100, longDescription, true)
      }).toThrow('Description cannot exceed 500 characters')
    })

    it('should accept description with exactly 500 characters', () => {
      const maxDescription = 'a'.repeat(500)

      const product = new Product('1', 'Laptop', 100, maxDescription, true)

      expect(product.description).toBe(maxDescription)
    })

    it('should accept valid product with out of stock status', () => {
      const product = new Product('1', 'Laptop', 100, 'Description', false)

      expect(product.inStock).toBe(false)
    })

    it('should accept decimal prices', () => {
      const product = new Product('1', 'Mouse', 29.99, 'Wireless mouse', true)

      expect(product.price).toBe(29.99)
    })

    it('should accept very small positive prices', () => {
      const product = new Product('1', 'Sticker', 0.01, 'Small sticker', true)

      expect(product.price).toBe(0.01)
    })
  })

  describe('getFormattedPrice', () => {
    it('should format price with dollar sign and two decimals', () => {
      const product = new Product('1', 'Laptop', 999.99, 'Description', true)

      expect(product.getFormattedPrice()).toBe('$999.99')
    })

    it('should format whole number prices with two decimal places', () => {
      const product = new Product('1', 'Monitor', 300, 'Description', true)

      expect(product.getFormattedPrice()).toBe('$300.00')
    })

    it('should format prices with one decimal place', () => {
      const product = new Product('1', 'Cable', 9.5, 'Description', true)

      expect(product.getFormattedPrice()).toBe('$9.50')
    })

    it('should format very small prices correctly', () => {
      const product = new Product('1', 'Sticker', 0.99, 'Description', true)

      expect(product.getFormattedPrice()).toBe('$0.99')
    })

    it('should format large prices correctly', () => {
      const product = new Product('1', 'Server', 15999.99, 'Description', true)

      expect(product.getFormattedPrice()).toBe('$15999.99')
    })
  })

  describe('isAvailable', () => {
    it('should return true for in-stock product with positive price', () => {
      const product = new Product('1', 'Laptop', 999.99, 'Description', true)

      expect(product.isAvailable()).toBe(true)
    })

    it('should return false for out-of-stock product', () => {
      const product = new Product('1', 'Laptop', 999.99, 'Description', false)

      expect(product.isAvailable()).toBe(false)
    })

    it('should return true for in-stock product with minimum valid price', () => {
      const product = new Product('1', 'Sticker', 0.01, 'Description', true)

      expect(product.isAvailable()).toBe(true)
    })
  })

  describe('getShortDescription', () => {
    it('should return full description if under max length', () => {
      const product = new Product('1', 'Mouse', 29.99, 'Wireless mouse', true)

      expect(product.getShortDescription(100)).toBe('Wireless mouse')
    })

    it('should return full description if exactly at max length', () => {
      const description = 'a'.repeat(100)
      const product = new Product('1', 'Product', 10, description, true)

      expect(product.getShortDescription(100)).toBe(description)
    })

    it('should truncate description if over max length', () => {
      const longDescription = 'This is a very long description that exceeds the maximum length'
      const product = new Product('1', 'Product', 10, longDescription, true)

      const short = product.getShortDescription(20)

      expect(short).toBe('This is a very long ...')
      expect(short.length).toBe(23) // 20 chars + '...'
    })

    it('should use default max length of 100', () => {
      const longDescription = 'a'.repeat(150)
      const product = new Product('1', 'Product', 10, longDescription, true)

      const short = product.getShortDescription()

      expect(short.length).toBe(103) // 100 chars + '...'
      expect(short.endsWith('...')).toBe(true)
    })

    it('should preserve original description when called with short description', () => {
      const description = 'Short desc'
      const product = new Product('1', 'Product', 10, description, true)

      product.getShortDescription(5) // Call method

      // Original description should remain unchanged
      expect(product.description).toBe(description)
    })

    it('should handle empty description', () => {
      const product = new Product('1', 'Product', 10, '', true)

      expect(product.getShortDescription(10)).toBe('')
    })

    it('should handle description with special characters', () => {
      const description = 'Product with émojis 🎉 and spëcial çhars'
      const product = new Product('1', 'Product', 10, description, true)

      const short = product.getShortDescription(20)

      expect(short.startsWith('Product with émojis')).toBe(true)
    })
  })

  // Note: TypeScript readonly properties are enforced at compile-time only
  // JavaScript doesn't throw runtime errors for readonly violations
})
