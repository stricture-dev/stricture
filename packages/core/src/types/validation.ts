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
  violatedRule?: import('./rule.js').ArchRule | undefined // The rule that was violated
  fromBoundary?: string | undefined // Source boundary name
  toBoundary?: string | undefined // Target boundary name
  message?: string | undefined // Human-readable error message
  suggestion?: string | undefined // Suggested fix
}
