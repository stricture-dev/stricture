import type { ValidationError } from '../types/validation.js'

/**
 * Create a validation error
 */
export function createError(
  path: string,
  message: string,
  code: string
): ValidationError {
  return { path, message, code }
}

/**
 * Check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * Validate that a required field exists
 */
export function validateRequired(
  obj: Record<string, unknown>,
  field: string,
  basePath: string = ''
): ValidationError | null {
  if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Missing required field: ${field}`,
      'MISSING_REQUIRED_FIELD'
    )
  }
  return null
}

/**
 * Validate that a field is a string
 */
export function validateString(
  obj: Record<string, unknown>,
  field: string,
  basePath: string = ''
): ValidationError | null {
  if (field in obj && !isString(obj[field])) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Field '${field}' must be a string`,
      'INVALID_TYPE'
    )
  }
  return null
}

/**
 * Validate that a field is a boolean
 */
export function validateBoolean(
  obj: Record<string, unknown>,
  field: string,
  basePath: string = ''
): ValidationError | null {
  if (field in obj && !isBoolean(obj[field])) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Field '${field}' must be a boolean`,
      'INVALID_TYPE'
    )
  }
  return null
}

/**
 * Validate that a field is an array
 */
export function validateArray(
  obj: Record<string, unknown>,
  field: string,
  basePath: string = ''
): ValidationError | null {
  if (field in obj && !isArray(obj[field])) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Field '${field}' must be an array`,
      'INVALID_TYPE'
    )
  }
  return null
}

/**
 * Validate that a field is an object
 */
export function validateObject(
  obj: Record<string, unknown>,
  field: string,
  basePath: string = ''
): ValidationError | null {
  if (field in obj && !isObject(obj[field])) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Field '${field}' must be an object`,
      'INVALID_TYPE'
    )
  }
  return null
}

/**
 * Validate that a field is one of allowed values
 */
export function validateEnum<T extends string>(
  obj: Record<string, unknown>,
  field: string,
  allowedValues: T[],
  basePath: string = ''
): ValidationError | null {
  if (field in obj && !allowedValues.includes(obj[field] as T)) {
    const path = basePath ? `${basePath}.${field}` : field
    return createError(
      path,
      `Field '${field}' must be one of: ${allowedValues.join(', ')}`,
      'INVALID_ENUM_VALUE'
    )
  }
  return null
}
