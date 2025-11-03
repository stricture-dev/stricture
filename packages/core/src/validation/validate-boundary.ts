import type { ValidationResult } from '../types/validation.js'
import type { RawBoundaryDefinition } from '../types/raw-validation.js'
import {
  isObject,
  validateRequired,
  validateString,
  validateEnum,
  createError
} from './validators.js'

/**
 * Validates a boundary definition
 */
export function validateBoundary(boundary: unknown): ValidationResult {
  const errors = []

  // Must be an object
  if (!isObject(boundary)) {
    return {
      valid: false,
      errors: [createError('', 'Boundary must be an object', 'INVALID_TYPE')]
    }
  }

  // Type as RawBoundaryDefinition for dot notation access
  const rawBoundary = boundary as RawBoundaryDefinition

  // Required fields
  const nameError = validateRequired(boundary, 'name')
  if (nameError) errors.push(nameError)

  const patternError = validateRequired(boundary, 'pattern')
  if (patternError) errors.push(patternError)

  const modeError = validateRequired(boundary, 'mode')
  if (modeError) errors.push(modeError)

  // Type validation
  const nameTypeError = validateString(boundary, 'name')
  if (nameTypeError) errors.push(nameTypeError)

  const patternTypeError = validateString(boundary, 'pattern')
  if (patternTypeError) errors.push(patternTypeError)

  // Mode must be 'file' or 'folder'
  const modeEnumError = validateEnum(boundary, 'mode', ['file', 'folder'])
  if (modeEnumError) {
    errors.push(
      createError('mode', `Mode must be 'file' or 'folder'`, 'INVALID_MODE')
    )
  }

  // Optional fields type validation - now with dot notation!
  if ('tags' in rawBoundary && !Array.isArray(rawBoundary.tags)) {
    errors.push(createError('tags', 'Tags must be an array', 'INVALID_TYPE'))
  }

  if ('exclude' in rawBoundary && !Array.isArray(rawBoundary.exclude)) {
    errors.push(createError('exclude', 'Exclude must be an array', 'INVALID_TYPE'))
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
