import type { ValidationResult } from '../types/validation.js'
import type { RawBoundaryPattern, RawArchRule } from '../types/raw-validation.js'
import {
  isObject,
  validateRequired,
  validateString,
  validateBoolean,
  validateEnum,
  createError
} from './validators.js'

/**
 * Validates a boundary pattern within a rule
 */
function validateBoundaryPattern(
  pattern: unknown,
  basePath: string
): ValidationResult['errors'] {
  const errors = []

  if (!isObject(pattern)) {
    errors.push(createError(basePath, 'Boundary pattern must be an object', 'INVALID_TYPE'))
    return errors
  }

  // Type as RawBoundaryPattern for dot notation access
  const rawPattern = pattern as RawBoundaryPattern

  // Must have either pattern or tag
  const hasPattern = 'pattern' in rawPattern && rawPattern.pattern
  const hasTag = 'tag' in rawPattern && rawPattern.tag

  if (!hasPattern && !hasTag) {
    errors.push(
      createError(
        basePath,
        'Boundary pattern must have either pattern or tag',
        'MISSING_REQUIRED_FIELD'
      )
    )
  }

  // Mode is required
  const modeError = validateRequired(pattern, 'mode', basePath)
  if (modeError) errors.push(modeError)

  // Validate mode enum
  const modeEnumError = validateEnum(pattern, 'mode', ['file', 'folder'], basePath)
  if (modeEnumError) {
    errors.push(
      createError(
        `${basePath}.mode`,
        `Mode must be 'file' or 'folder'`,
        'INVALID_MODE'
      )
    )
  }

  // Validate types if present
  if ('pattern' in pattern) {
    const patternTypeError = validateString(pattern, 'pattern', basePath)
    if (patternTypeError) errors.push(patternTypeError)
  }

  if ('tag' in pattern) {
    const tagTypeError = validateString(pattern, 'tag', basePath)
    if (tagTypeError) errors.push(tagTypeError)
  }

  if ('exclude' in rawPattern && !Array.isArray(rawPattern.exclude)) {
    errors.push(
      createError(`${basePath}.exclude`, 'Exclude must be an array', 'INVALID_TYPE')
    )
  }

  return errors
}

/**
 * Validates an architectural rule
 */
export function validateRule(rule: unknown): ValidationResult {
  const errors = []

  // Must be an object
  if (!isObject(rule)) {
    return {
      valid: false,
      errors: [createError('', 'Rule must be an object', 'INVALID_TYPE')]
    }
  }

  // Type as RawArchRule for dot notation access
  const rawRule = rule as RawArchRule

  // Required fields
  const requiredFields = ['id', 'name', 'description', 'severity', 'from', 'to', 'allowed']

  for (const field of requiredFields) {
    const error = validateRequired(rule, field)
    if (error) errors.push(error)
  }

  // Type validation for string fields
  const stringFields = ['id', 'name', 'description']
  for (const field of stringFields) {
    const error = validateString(rule, field)
    if (error) errors.push(error)
  }

  // Severity validation
  const severityError = validateEnum(rule, 'severity', ['error', 'warn', 'off'])
  if (severityError) {
    errors.push(
      createError('severity', `Severity must be 'error', 'warn', or 'off'`, 'INVALID_SEVERITY')
    )
  }

  // Allowed validation
  const allowedError = validateBoolean(rule, 'allowed')
  if (allowedError) errors.push(allowedError)

  // Validate from and to boundary patterns - now with dot notation!
  if ('from' in rawRule) {
    const fromErrors = validateBoundaryPattern(rawRule.from, 'from')
    errors.push(...fromErrors)
  }

  if ('to' in rawRule) {
    const toErrors = validateBoundaryPattern(rawRule.to, 'to')
    errors.push(...toErrors)
  }

  // Optional message field
  if ('message' in rule) {
    const messageError = validateString(rule, 'message')
    if (messageError) errors.push(messageError)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
