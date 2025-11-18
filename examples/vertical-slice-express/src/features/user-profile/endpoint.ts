/**
 * User Profile Endpoint
 * HTTP route for retrieving user profiles
 */

import express, { Router } from 'express'
import { getUserById } from './query.js'
import { success, error } from '../../shared/http/response.js'

export const router: Router = express.Router()

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id

    // Execute query (business logic)
    const user = await getUserById(userId)

    // Check if user exists
    if (!user) {
      return error(res, 404, 'User not found')
    }

    // Return successful response
    return success(res, 200, { user })
  } catch (err) {
    console.error('Error fetching user profile:', err)
    return error(res, 500, 'Internal server error')
  }
})
