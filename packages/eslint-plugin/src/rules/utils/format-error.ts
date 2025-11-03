import type { ImportValidationResult } from '@stricture/core'

/**
 * Format an ImportValidationResult from @stricture/core into a human-readable error message
 *
 * This is purely a formatting utility - it doesn't do any validation.
 * It takes the result from core's validateImport() and formats it nicely for ESLint.
 *
 * The formatted message includes:
 * - The main error message from core
 * - Suggestion if available
 * - Rule information (name, id)
 * - Examples of allowed imports if available
 */
export function formatErrorMessage(result: ImportValidationResult): string {
  // If valid, return empty (this shouldn't be called for valid results)
  if (result.valid) {
    return ''
  }

  // Start with the main message from core
  let message = result.message || 'Import not allowed'

  // Add suggestion if available
  if (result.suggestion) {
    message += `\n\nSuggestion: ${result.suggestion}`
  }

  // Add rule information if available
  if (result.violatedRule) {
    const rule = result.violatedRule
    message += `\n\nRule: ${rule.name}`

    if (rule.id) {
      message += ` (${rule.id})`
    }

    // Add rule description if different from message
    if (rule.description && rule.description !== result.message) {
      message += `\n${rule.description}`
    }

    // Add good examples if available
    if (rule.examples?.good && rule.examples.good.length > 0) {
      message += '\n\nAllowed:'
      rule.examples.good.forEach(example => {
        message += `\n  ✓ ${example}`
      })
    }
  }

  return message
}
