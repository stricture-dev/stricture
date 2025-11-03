import type { BoundaryPattern } from './boundary.js'

/**
 * Represents a single architectural boundary enforcement rule
 */
export interface ArchRule {
  id: string // Unique identifier (e.g., 'no-domain-external')
  name: string // Display name (e.g., 'Domain Isolation')
  description: string // Detailed explanation
  severity: 'error' | 'warn' // How to report violations
  from: BoundaryPattern // Source boundary
  to: BoundaryPattern // Target boundary
  allowed: boolean // Whether import is permitted
  message?: string // Custom error message
  examples?: {
    good: string[] // Valid import examples
    bad: string[] // Invalid import examples
  }
  metadata?: Record<string, unknown>
}
