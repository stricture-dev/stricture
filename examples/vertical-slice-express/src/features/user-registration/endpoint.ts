/**
 * User Registration Endpoint
 * HTTP route and request handling
 */

import express, { Router } from 'express'
import { registerUser } from './command.js'
import { validateRegistration } from './validator.js'
import { success, error } from '../../shared/http/response.js'

export const router: Router = express.Router()

/**
 * POST /api/users/register
 * Register a new user
 */
router.post('/users/register', async (req, res) => {
  try {
    // 1. Validate request body
    const validation = validateRegistration(req.body)
    if (!validation.valid) {
      return error(res, 400, validation.error!)
    }

    // 2. Execute business logic (command)
    const user = await registerUser(validation.data!)

    // 3. Return successful response
    return success(res, 201, { user })
  } catch (err) {
    // Handle unexpected errors
    console.error('Error in user registration:', err)
    return error(res, 500, 'Internal server error')
  }
})
