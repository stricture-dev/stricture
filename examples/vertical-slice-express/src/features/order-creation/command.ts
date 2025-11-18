/**
 * Order Creation Command
 * Business logic for creating new orders
 */

import { db } from '../../shared/database/client.js'

export interface CreateOrderInput {
  userId: string
  items: string[]
  total: number
}

export interface Order {
  id: string
  userId: string
  items: string[]
  total: number
  createdAt: Date
}

/**
 * Create a new order
 * @param input - Order creation data
 * @returns Created order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Generate unique order ID
  const orderId = generateOrderId()
  const now = new Date()

  // Create order object
  const order: Order = {
    id: orderId,
    userId: input.userId,
    items: input.items,
    total: input.total,
    createdAt: now
  }

  // Persist to database
  await db.orders.set(orderId, order)

  return order
}

/**
 * Generate a unique order ID
 * In production, this could use UUID or database auto-increment
 */
function generateOrderId(): string {
  return `order_${Math.random().toString(36).substr(2, 9)}`
}
