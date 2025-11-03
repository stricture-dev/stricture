/**
 * Result of configuration/rule validation operations
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Detailed validation error with path and code
 */
export interface ValidationError {
  path: string // JSON path to error (e.g., 'rules[0].from')
  message: string
  code: string // Error code (e.g., 'MISSING_REQUIRED_FIELD')
}

/**
 * Result of import validation (different from config validation)
 */
export interface ImportValidationResult {
  valid: boolean
  violatedRule?: import('./rule.js').ArchRule // The rule that was violated
  fromBoundary?: string // Source boundary name
  toBoundary?: string // Target boundary name
  message?: string // Human-readable error message
  suggestion?: string // Suggested fix
}
