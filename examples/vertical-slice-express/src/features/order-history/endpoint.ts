/**
 * Order History Endpoint
 * HTTP route for retrieving user's order history
 */

import express, { Router } from 'express'
import { getOrdersByUserId } from './query.js'
import { success, error } from '../../shared/http/response.js'

export const router: Router = express.Router()

/**
 * GET /api/users/:userId/orders
 * Get all orders for a user
 */
router.get('/users/:userId/orders', async (req, res) => {
  try {
    const userId = req.params.userId

    // Execute query (business logic)
    const orders = await getOrdersByUserId(userId)

    // Return successful response
    return success(res, 200, { orders, count: orders.length })
  } catch (err) {
    console.error('Error fetching order history:', err)
    return error(res, 500, 'Internal server error')
  }
})
