/**
 * Generic email validation utility
 * Used by features that need email validation
 */

export function isValidEmail(email: string): boolean {
  // Simple email validation for demonstration
  // In production, use a library like validator.js or a regex
  return email.includes('@') && email.includes('.')
}
