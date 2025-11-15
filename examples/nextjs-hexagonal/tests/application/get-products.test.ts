import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetProductsUseCase } from '../../src/core/application/get-products'
import { ProductRepository } from '../../src/core/ports/product-repository'
import { Product } from '../../src/core/domain/product'

describe('GetProductsUseCase', () => {
  let mockRepository: ProductRepository
  let useCase: GetProductsUseCase

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    }
    useCase = new GetProductsUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should return all products from repository', async () => {
      const mockProducts = [
        new Product('1', 'Laptop', 999.99, 'High-performance laptop', true),
        new Product('2', 'Mouse', 29.99, 'Wireless mouse', true),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProducts)

      const result = await useCase.execute()

      expect(result).toEqual(mockProducts)
      expect(result).toHaveLength(2)
      expect(mockRepository.findAll).toHaveBeenCalledOnce()
    })

    it('should return empty array when no products exist', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([])

      const result = await useCase.execute()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
      expect(mockRepository.findAll).toHaveBeenCalledOnce()
    })

    it('should return products with correct properties', async () => {
      const mockProducts = [
        new Product('1', 'Keyboard', 79.99, 'Mechanical keyboard', false),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProducts)

      const result = await useCase.execute()

      expect(result[0]?.id).toBe('1')
      expect(result[0]?.name).toBe('Keyboard')
      expect(result[0]?.price).toBe(79.99)
      expect(result[0]?.description).toBe('Mechanical keyboard')
      expect(result[0]?.inStock).toBe(false)
    })

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed')
      vi.mocked(mockRepository.findAll).mockRejectedValue(error)

      await expect(useCase.execute()).rejects.toThrow('Database connection failed')
    })

    it('should return products with business methods available', async () => {
      const mockProducts = [
        new Product('1', 'Monitor', 299.99, 'Description', true),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProducts)

      const result = await useCase.execute()

      expect(result[0]?.getFormattedPrice()).toBe('$299.99')
      expect(result[0]?.isAvailable()).toBe(true)
    })

    it('should handle large number of products', async () => {
      const mockProducts = Array.from({ length: 100 }, (_, i) =>
        new Product(
          `${i}`,
          `Product ${i}`,
          i + 1,
          `Description ${i}`,
          true
        )
      )

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProducts)

      const result = await useCase.execute()

      expect(result).toHaveLength(100)
      expect(mockRepository.findAll).toHaveBeenCalledOnce()
    })

    it('should not modify products from repository', async () => {
      const mockProducts = [
        new Product('1', 'Laptop', 999.99, 'Description', true),
      ]

      vi.mocked(mockRepository.findAll).mockResolvedValue(mockProducts)

      const result = await useCase.execute()

      // Verify result is the same reference (not cloned)
      expect(result).toBe(mockProducts)
    })
  })

  describe('dependency injection', () => {
    it('should use the injected repository', async () => {
      const customMockRepository: ProductRepository = {
        findAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
      }

      const customUseCase = new GetProductsUseCase(customMockRepository)
      await customUseCase.execute()

      expect(customMockRepository.findAll).toHaveBeenCalledOnce()
      expect(mockRepository.findAll).not.toHaveBeenCalled()
    })

    it('should allow swapping repository implementations', async () => {
      const repository1: ProductRepository = {
        findAll: vi.fn().mockResolvedValue([
          new Product('1', 'Product 1', 10, 'Desc', true),
        ]),
        findById: vi.fn(),
      }

      const repository2: ProductRepository = {
        findAll: vi.fn().mockResolvedValue([
          new Product('2', 'Product 2', 20, 'Desc', true),
        ]),
        findById: vi.fn(),
      }

      const useCase1 = new GetProductsUseCase(repository1)
      const useCase2 = new GetProductsUseCase(repository2)

      const result1 = await useCase1.execute()
      const result2 = await useCase2.execute()

      expect(result1[0]?.id).toBe('1')
      expect(result2[0]?.id).toBe('2')
    })
  })
})
