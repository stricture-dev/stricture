/**
 * Order Creation Endpoint
 * HTTP route for creating orders
 */

import express, { Router } from 'express'
import { createOrder } from './command.js'
import { success, error } from '../../shared/http/response.js'

export const router: Router = express.Router()

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/orders', async (req, res) => {
  try {
    const { userId, items, total } = req.body

    // Basic validation
    if (!userId || typeof userId !== 'string') {
      return error(res, 400, 'userId is required')
    }

    if (!Array.isArray(items) || items.length === 0) {
      return error(res, 400, 'items must be a non-empty array')
    }

    if (typeof total !== 'number' || total <= 0) {
      return error(res, 400, 'total must be a positive number')
    }

    // Execute business logic (command)
    const order = await createOrder({ userId, items, total })

    // Return successful response
    return success(res, 201, { order })
  } catch (err) {
    console.error('Error creating order:', err)
    return error(res, 500, 'Internal server error')
  }
})
