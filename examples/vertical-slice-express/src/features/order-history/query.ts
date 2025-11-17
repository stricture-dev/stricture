/**
 * Order History Query
 * Business logic for fetching order data
 */

import { db } from '../../shared/database/client.js'

export interface Order {
  id: string
  userId: string
  items: string[]
  total: number
  createdAt: Date
}

/**
 * Get all orders for a specific user
 * @param userId - User's unique identifier
 * @returns Array of orders
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  // Get all orders and filter by userId
  const allOrders = Array.from(db.orders.values())
  return allOrders.filter(order => order.userId === userId)
}
