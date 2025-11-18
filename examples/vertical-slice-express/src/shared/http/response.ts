/**
 * HTTP response helpers
 * Standardizes response format across all features
 */

import { Response } from 'express'

/**
 * Send a successful response
 * @param res - Express response object
 * @param status - HTTP status code (200, 201, etc.)
 * @param data - Response data
 */
export function success(res: Response, status: number, data: any) {
  return res.status(status).json({
    success: true,
    data
  })
}

/**
 * Send an error response
 * @param res - Express response object
 * @param status - HTTP status code (400, 500, etc.)
 * @param message - Error message
 */
export function error(res: Response, status: number, message: string) {
  return res.status(status).json({
    success: false,
    error: message
  })
}
