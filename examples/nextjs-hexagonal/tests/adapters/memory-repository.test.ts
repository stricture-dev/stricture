import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryProductRepository } from '../../src/adapters/driven/memory-repository'
import { Product } from '../../src/core/domain/product'

describe('MemoryProductRepository', () => {
  let repository: MemoryProductRepository

  beforeEach(() => {
    repository = new MemoryProductRepository()
  })

  describe('initialization', () => {
    it('should pre-populate with sample products', async () => {
      const products = await repository.findAll()

      expect(products.length).toBeGreaterThan(0)
    })

    it('should have products with valid IDs', async () => {
      const products = await repository.findAll()

      products.forEach(product => {
        expect(product.id).toBeDefined()
        expect(typeof product.id).toBe('string')
        expect(product.id.length).toBeGreaterThan(0)
      })
    })

    it('should have products with valid data', async () => {
      const products = await repository.findAll()

      products.forEach(product => {
        expect(product).toBeInstanceOf(Product)
        expect(product.name).toBeDefined()
        expect(product.price).toBeGreaterThan(0)
        expect(product.description).toBeDefined()
        expect(typeof product.inStock).toBe('boolean')
      })
    })
  })

  describe('findAll', () => {
    it('should return all seeded products', async () => {
      const products = await repository.findAll()

      // Based on the seed data, we expect 8 products
      expect(products).toHaveLength(8)
    })

    it('should return array of Product instances', async () => {
      const products = await repository.findAll()

      products.forEach(product => {
        expect(product).toBeInstanceOf(Product)
      })
    })

    it('should return products with business methods available', async () => {
      const products = await repository.findAll()

      const firstProduct = products[0]
      expect(firstProduct).toBeDefined()
      expect(typeof firstProduct?.getFormattedPrice()).toBe('string')
      expect(typeof firstProduct?.isAvailable()).toBe('boolean')
    })

    it('should return consistent results on multiple calls', async () => {
      const products1 = await repository.findAll()
      const products2 = await repository.findAll()

      expect(products1.length).toBe(products2.length)
      expect(products1[0]?.id).toBe(products2[0]?.id)
    })

    it('should include specific seeded products', async () => {
      const products = await repository.findAll()

      // Check for some expected products from seed data
      const laptop = products.find(p => p.name === 'Laptop')
      const mouse = products.find(p => p.name === 'Wireless Mouse')

      expect(laptop).toBeDefined()
      expect(laptop?.price).toBe(999.99)
      expect(mouse).toBeDefined()
      expect(mouse?.price).toBe(29.99)
    })
  })

  describe('findById', () => {
    it('should return product when found', async () => {
      // We know ID '1' exists from seed data
      const product = await repository.findById('1')

      expect(product).toBeDefined()
      expect(product).toBeInstanceOf(Product)
      expect(product?.id).toBe('1')
    })

    it('should return null when product not found', async () => {
      const product = await repository.findById('999')

      expect(product).toBeNull()
    })

    it('should return correct product by ID', async () => {
      const product = await repository.findById('1')

      expect(product?.name).toBe('Laptop')
      expect(product?.price).toBe(999.99)
    })

    it('should return different products for different IDs', async () => {
      const product1 = await repository.findById('1')
      const product2 = await repository.findById('2')

      expect(product1?.id).toBe('1')
      expect(product2?.id).toBe('2')
      expect(product1?.name).not.toBe(product2?.name)
    })

    it('should return product with all properties', async () => {
      const product = await repository.findById('3')

      expect(product).toBeDefined()
      expect(product?.id).toBe('3')
      expect(product?.name).toBeDefined()
      expect(product?.price).toBeGreaterThan(0)
      expect(product?.description).toBeDefined()
      expect(typeof product?.inStock).toBe('boolean')
    })

    it('should return product with business methods', async () => {
      const product = await repository.findById('1')

      expect(product).toBeDefined()
      expect(product?.getFormattedPrice()).toBe('$999.99')
      expect(typeof product?.isAvailable()).toBe('boolean')
    })

    it('should handle empty string ID', async () => {
      const product = await repository.findById('')

      expect(product).toBeNull()
    })

    it('should handle special character IDs gracefully', async () => {
      const product = await repository.findById('id-with-dashes')

      expect(product).toBeNull()
    })

    it('should return null for numeric string that does not exist', async () => {
      const product = await repository.findById('12345')

      expect(product).toBeNull()
    })
  })

  describe('seeded data integrity', () => {
    it('should have laptop as first product', async () => {
      const product = await repository.findById('1')

      expect(product?.name).toBe('Laptop')
      expect(product?.inStock).toBe(true)
    })

    it('should have mechanical keyboard as out of stock', async () => {
      const product = await repository.findById('3')

      expect(product?.name).toBe('Mechanical Keyboard')
      expect(product?.inStock).toBe(false)
    })

    it('should have headphones as out of stock', async () => {
      const product = await repository.findById('7')

      expect(product?.name).toBe('Headphones')
      expect(product?.inStock).toBe(false)
    })

    it('should have products with varying prices', async () => {
      const products = await repository.findAll()

      const prices = products.map(p => p.price)
      const uniquePrices = new Set(prices)

      expect(uniquePrices.size).toBeGreaterThan(1)
    })

    it('should have mix of in-stock and out-of-stock products', async () => {
      const products = await repository.findAll()

      const inStock = products.filter(p => p.inStock)
      const outOfStock = products.filter(p => !p.inStock)

      expect(inStock.length).toBeGreaterThan(0)
      expect(outOfStock.length).toBeGreaterThan(0)
    })
  })

  describe('interface compliance', () => {
    it('should implement ProductRepository interface', async () => {
      // TypeScript will enforce this at compile time, but we can verify runtime behavior
      expect(typeof repository.findAll).toBe('function')
      expect(typeof repository.findById).toBe('function')

      const allProducts = await repository.findAll()
      expect(Array.isArray(allProducts)).toBe(true)

      const singleProduct = await repository.findById('1')
      expect(singleProduct === null || singleProduct instanceof Product).toBe(true)
    })

    it('should return promises from all methods', () => {
      const findAllResult = repository.findAll()
      const findByIdResult = repository.findById('1')

      expect(findAllResult).toBeInstanceOf(Promise)
      expect(findByIdResult).toBeInstanceOf(Promise)
    })
  })

  describe('isolation', () => {
    it('should create independent instances', async () => {
      const repository1 = new MemoryProductRepository()
      const repository2 = new MemoryProductRepository()

      const products1 = await repository1.findAll()
      const products2 = await repository2.findAll()

      // Both should have same initial data
      expect(products1.length).toBe(products2.length)

      // But modifications to one shouldn't affect the other
      // (This test is more relevant if we add save/update methods)
    })
  })
})
