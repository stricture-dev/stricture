import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetProductByIdUseCase } from '../../src/core/application/get-product-by-id'
import { ProductRepository } from '../../src/core/ports/product-repository'
import { Product } from '../../src/core/domain/product'

describe('GetProductByIdUseCase', () => {
  let mockRepository: ProductRepository
  let useCase: GetProductByIdUseCase

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    }
    useCase = new GetProductByIdUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should return product when found', async () => {
      const mockProduct = new Product(
        '1',
        'Laptop',
        999.99,
        'High-performance laptop',
        true
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct)

      const result = await useCase.execute('1')

      expect(result).toEqual(mockProduct)
      expect(result.id).toBe('1')
      expect(mockRepository.findById).toHaveBeenCalledWith('1')
      expect(mockRepository.findById).toHaveBeenCalledOnce()
    })

    it('should throw error when product not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(useCase.execute('999')).rejects.toThrow(
        'Product with ID "999" not found'
      )

      expect(mockRepository.findById).toHaveBeenCalledWith('999')
    })

    it('should throw error for empty ID', async () => {
      await expect(useCase.execute('')).rejects.toThrow(
        'Product ID cannot be empty'
      )

      expect(mockRepository.findById).not.toHaveBeenCalled()
    })

    it('should throw error for whitespace-only ID', async () => {
      await expect(useCase.execute('   ')).rejects.toThrow(
        'Product ID cannot be empty'
      )

      expect(mockRepository.findById).not.toHaveBeenCalled()
    })

    it('should return product with all properties', async () => {
      const mockProduct = new Product(
        'abc123',
        'Keyboard',
        79.99,
        'Mechanical keyboard',
        false
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct)

      const result = await useCase.execute('abc123')

      expect(result.id).toBe('abc123')
      expect(result.name).toBe('Keyboard')
      expect(result.price).toBe(79.99)
      expect(result.description).toBe('Mechanical keyboard')
      expect(result.inStock).toBe(false)
    })

    it('should return product with business methods available', async () => {
      const mockProduct = new Product(
        '1',
        'Monitor',
        299.99,
        'Description',
        true
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct)

      const result = await useCase.execute('1')

      expect(result.getFormattedPrice()).toBe('$299.99')
      expect(result.isAvailable()).toBe(true)
    })

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed')
      vi.mocked(mockRepository.findById).mockRejectedValue(error)

      await expect(useCase.execute('1')).rejects.toThrow(
        'Database connection failed'
      )
    })

    it('should handle special characters in ID', async () => {
      const mockProduct = new Product(
        'prod-123-abc',
        'Product',
        10,
        'Description',
        true
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct)

      const result = await useCase.execute('prod-123-abc')

      expect(result.id).toBe('prod-123-abc')
      expect(mockRepository.findById).toHaveBeenCalledWith('prod-123-abc')
    })

    it('should handle numeric string IDs', async () => {
      const mockProduct = new Product(
        '12345',
        'Product',
        10,
        'Description',
        true
      )

      vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct)

      const result = await useCase.execute('12345')

      expect(result.id).toBe('12345')
    })

    it('should include the ID in not found error message', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      await expect(useCase.execute('missing-id')).rejects.toThrow(
        'Product with ID "missing-id" not found'
      )
    })
  })

  describe('dependency injection', () => {
    it('should use the injected repository', async () => {
      const customMockRepository: ProductRepository = {
        findAll: vi.fn(),
        findById: vi.fn().mockResolvedValue(
          new Product('1', 'Product', 10, 'Desc', true)
        ),
      }

      const customUseCase = new GetProductByIdUseCase(customMockRepository)
      await customUseCase.execute('1')

      expect(customMockRepository.findById).toHaveBeenCalledOnce()
      expect(mockRepository.findById).not.toHaveBeenCalled()
    })

    it('should allow swapping repository implementations', async () => {
      const repository1: ProductRepository = {
        findAll: vi.fn(),
        findById: vi.fn().mockResolvedValue(
          new Product('1', 'Product 1', 10, 'Desc', true)
        ),
      }

      const repository2: ProductRepository = {
        findAll: vi.fn(),
        findById: vi.fn().mockResolvedValue(
          new Product('1', 'Product 2', 20, 'Desc', true)
        ),
      }

      const useCase1 = new GetProductByIdUseCase(repository1)
      const useCase2 = new GetProductByIdUseCase(repository2)

      const result1 = await useCase1.execute('1')
      const result2 = await useCase2.execute('1')

      expect(result1.name).toBe('Product 1')
      expect(result2.name).toBe('Product 2')
    })
  })

  describe('error messages', () => {
    it('should provide clear error message for empty ID', async () => {
      await expect(useCase.execute('')).rejects.toThrow(
        'Product ID cannot be empty'
      )
    })

    it('should provide clear error message with ID for not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null)

      try {
        await useCase.execute('test-id')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('test-id')
        expect((error as Error).message).toContain('not found')
      }
    })
  })
})
