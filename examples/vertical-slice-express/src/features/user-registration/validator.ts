/**
 * User Registration Validator
 * Feature-specific validation logic
 */

import { isValidEmail } from '../../shared/validation/email.js'
import { RegisterUserInput } from './command.js'

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  error?: string
}

/**
 * Validate user registration input
 * @param body - Raw request body
 * @returns Validation result with typed data or error
 */
export function validateRegistration(body: any): ValidationResult<RegisterUserInput> {
  // Validate name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' }
  }

  // Validate email
  if (!body.email || typeof body.email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  if (!isValidEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Validate password
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  // Return validated and sanitized data
  return {
    valid: true,
    data: {
      name: body.name.trim(),
      email: body.email.toLowerCase(),
      password: body.password
    }
  }
}
