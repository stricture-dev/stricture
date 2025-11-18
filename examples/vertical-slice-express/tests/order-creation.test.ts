import { describe, it, expect, beforeEach } from 'vitest'
import { createOrder } from '../src/features/order-creation/command.js'
import { db } from '../src/shared/database/client.js'

describe('Order Creation', () => {
  beforeEach(() => {
    db.orders.clear()
  })

  describe('createOrder command', () => {
    it('should create an order with valid input', async () => {
      const input = {
        userId: 'user_123',
        items: ['item1', 'item2', 'item3'],
        total: 99.99
      }

      const order = await createOrder(input)

      expect(order.userId).toBe('user_123')
      expect(order.items).toEqual(['item1', 'item2', 'item3'])
      expect(order.total).toBe(99.99)
      expect(order.id).toMatch(/^order_/)
      expect(order.createdAt).toBeInstanceOf(Date)
    })

    it('should persist order to database', async () => {
      const input = {
        userId: 'user_456',
        items: ['product1'],
        total: 49.99
      }

      const order = await createOrder(input)
      const retrieved = db.orders.get(order.id)

      expect(retrieved).toEqual(order)
    })

    it('should generate unique order IDs', async () => {
      const input = {
        userId: 'user_789',
        items: ['item1'],
        total: 10.00
      }

      const order1 = await createOrder(input)
      const order2 = await createOrder(input)

      expect(order1.id).not.toBe(order2.id)
    })

    it('should handle single item orders', async () => {
      const input = {
        userId: 'user_single',
        items: ['single-item'],
        total: 25.50
      }

      const order = await createOrder(input)

      expect(order.items).toHaveLength(1)
      expect(order.items[0]).toBe('single-item')
    })

    it('should handle multiple item orders', async () => {
      const input = {
        userId: 'user_multi',
        items: ['item1', 'item2', 'item3', 'item4', 'item5'],
        total: 199.99
      }

      const order = await createOrder(input)

      expect(order.items).toHaveLength(5)
      expect(order.total).toBe(199.99)
    })

    it('should preserve order creation timestamp', async () => {
      const beforeCreation = new Date()

      const input = {
        userId: 'user_time',
        items: ['item1'],
        total: 15.00
      }

      const order = await createOrder(input)
      const afterCreation = new Date()

      expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime())
      expect(order.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime())
    })
  })
})
