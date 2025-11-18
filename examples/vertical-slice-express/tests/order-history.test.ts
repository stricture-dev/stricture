import { describe, it, expect, beforeEach } from 'vitest'
import { getOrdersByUserId } from '../src/features/order-history/query.js'
import { db } from '../src/shared/database/client.js'

describe('Order History', () => {
  beforeEach(() => {
    db.orders.clear()
  })

  describe('getOrdersByUserId query', () => {
    it('should return empty array when user has no orders', async () => {
      const orders = await getOrdersByUserId('user_123')

      expect(orders).toEqual([])
      expect(orders).toHaveLength(0)
    })

    it('should return orders for specific user', async () => {
      // Setup: Add orders for different users
      const order1 = {
        id: 'order_1',
        userId: 'user_123',
        items: ['item1'],
        total: 10.00,
        createdAt: new Date('2025-01-01')
      }
      const order2 = {
        id: 'order_2',
        userId: 'user_456',
        items: ['item2'],
        total: 20.00,
        createdAt: new Date('2025-01-02')
      }
      const order3 = {
        id: 'order_3',
        userId: 'user_123',
        items: ['item3'],
        total: 30.00,
        createdAt: new Date('2025-01-03')
      }

      db.orders.set(order1.id, order1)
      db.orders.set(order2.id, order2)
      db.orders.set(order3.id, order3)

      // Execute
      const orders = await getOrdersByUserId('user_123')

      // Verify
      expect(orders).toHaveLength(2)
      expect(orders).toContainEqual(order1)
      expect(orders).toContainEqual(order3)
      expect(orders).not.toContainEqual(order2)
    })

    it('should return all orders for user with multiple orders', async () => {
      // Setup: Add multiple orders for same user
      const userId = 'user_multi'
      const order1 = {
        id: 'order_1',
        userId,
        items: ['item1'],
        total: 10.00,
        createdAt: new Date()
      }
      const order2 = {
        id: 'order_2',
        userId,
        items: ['item2', 'item3'],
        total: 25.00,
        createdAt: new Date()
      }
      const order3 = {
        id: 'order_3',
        userId,
        items: ['item4'],
        total: 15.00,
        createdAt: new Date()
      }

      db.orders.set(order1.id, order1)
      db.orders.set(order2.id, order2)
      db.orders.set(order3.id, order3)

      // Execute
      const orders = await getOrdersByUserId(userId)

      // Verify
      expect(orders).toHaveLength(3)
      expect(orders.map(o => o.id).sort()).toEqual(['order_1', 'order_2', 'order_3'])
    })

    it('should not return orders from other users', async () => {
      // Setup: Add orders for different users
      db.orders.set('order_1', {
        id: 'order_1',
        userId: 'user_A',
        items: ['item1'],
        total: 10.00,
        createdAt: new Date()
      })
      db.orders.set('order_2', {
        id: 'order_2',
        userId: 'user_B',
        items: ['item2'],
        total: 20.00,
        createdAt: new Date()
      })

      // Execute
      const ordersA = await getOrdersByUserId('user_A')
      const ordersB = await getOrdersByUserId('user_B')

      // Verify
      expect(ordersA).toHaveLength(1)
      expect(ordersA[0]?.userId).toBe('user_A')
      expect(ordersB).toHaveLength(1)
      expect(ordersB[0]?.userId).toBe('user_B')
    })

    it('should handle empty database', async () => {
      const orders = await getOrdersByUserId('any_user')

      expect(orders).toEqual([])
    })

    it('should preserve order data structure', async () => {
      // Setup
      const order = {
        id: 'order_123',
        userId: 'user_123',
        items: ['product1', 'product2'],
        total: 99.99,
        createdAt: new Date('2025-01-15T10:30:00Z')
      }
      db.orders.set(order.id, order)

      // Execute
      const orders = await getOrdersByUserId('user_123')

      // Verify
      expect(orders).toHaveLength(1)
      const retrievedOrder = orders[0]
      expect(retrievedOrder).toEqual(order)
      expect(retrievedOrder?.items).toEqual(['product1', 'product2'])
      expect(retrievedOrder?.total).toBe(99.99)
    })
  })
})
