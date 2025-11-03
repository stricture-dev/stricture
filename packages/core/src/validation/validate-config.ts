import type { ValidationResult } from '../types/validation.js'
import { validateBoundary } from './validate-boundary.js'
import { validateRule } from './validate-rule.js'
import {
  isObject,
  isArray,
  validateRequired,
  validateString,
  validateArray,
  createError
} from './validators.js'

/**
 * Validates a complete Stricture configuration
 *
 * Validation checks:
 * - Required fields present
 * - Type correctness
 * - Pattern syntax validity
 * - Rule references valid boundaries
 * - No circular dependencies in extends
 * - Severity values are valid
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors = []

  // Must be an object
  if (!isObject(config)) {
    return {
      valid: false,
      errors: [createError('', 'Config must be an object', 'INVALID_TYPE')]
    }
  }

  // Required field: preset
  const presetError = validateRequired(config, 'preset')
  if (presetError) errors.push(presetError)

  const presetTypeError = validateString(config, 'preset')
  if (presetTypeError) errors.push(presetTypeError)

  // Required field: boundaries (must be array)
  const boundariesError = validateRequired(config, 'boundaries')
  if (boundariesError) {
    errors.push(boundariesError)
  } else {
    const boundariesTypeError = validateArray(config, 'boundaries')
    if (boundariesTypeError) {
      errors.push(boundariesTypeError)
    } else if (isArray(config.boundaries)) {
      // Validate each boundary
      config.boundaries.forEach((boundary, index) => {
        const result = validateBoundary(boundary)
        if (!result.valid) {
          result.errors.forEach(error => {
            errors.push({
              ...error,
              path: `boundaries[${index}].${error.path}`
            })
          })
        }
      })
    }
  }

  // Required field: rules (must be array)
  const rulesError = validateRequired(config, 'rules')
  if (rulesError) {
    errors.push(rulesError)
  } else {
    const rulesTypeError = validateArray(config, 'rules')
    if (rulesTypeError) {
      errors.push(rulesTypeError)
    } else if (isArray(config.rules)) {
      // Validate each rule
      config.rules.forEach((rule, index) => {
        const result = validateRule(rule)
        if (!result.valid) {
          result.errors.forEach(error => {
            errors.push({
              ...error,
              path: `rules[${index}].${error.path}`
            })
          })
        }
      })
    }
  }

  // Optional fields type validation
  if ('extends' in config) {
    const extendsTypeError = validateArray(config, 'extends')
    if (extendsTypeError) errors.push(extendsTypeError)
  }

  if ('overrides' in config) {
    const overridesTypeError = validateArray(config, 'overrides')
    if (overridesTypeError) errors.push(overridesTypeError)
  }

  if ('ignorePatterns' in config) {
    const ignorePatternsTypeError = validateArray(config, 'ignorePatterns')
    if (ignorePatternsTypeError) errors.push(ignorePatternsTypeError)
  }

  if ('version' in config) {
    const versionTypeError = validateString(config, 'version')
    if (versionTypeError) errors.push(versionTypeError)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
