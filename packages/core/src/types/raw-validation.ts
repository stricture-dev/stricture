/**
 * Raw (unvalidated) types for validation functions
 *
 * These types represent the structure we expect from JSON/external input,
 * but with all fields as unknown since we haven't validated them yet.
 * This allows us to use dot notation while still being type-safe.
 */

/**
 * Raw boundary pattern before validation
 */
export interface RawBoundaryPattern {
  pattern?: unknown
  tag?: unknown
  mode?: unknown
  exclude?: unknown
}

/**
 * Raw boundary definition before validation
 */
export interface RawBoundaryDefinition {
  name?: unknown
  pattern?: unknown
  mode?: unknown
  tags?: unknown
  exclude?: unknown
}

/**
 * Raw rule examples before validation
 */
export interface RawRuleExamples {
  good?: unknown
  bad?: unknown
}

/**
 * Raw arch rule before validation
 */
export interface RawArchRule {
  id?: unknown
  name?: unknown
  description?: unknown
  severity?: unknown
  from?: unknown
  to?: unknown
  allowed?: unknown
  message?: unknown
  suggestion?: unknown
  examples?: unknown
  metadata?: unknown
}

/**
 * Raw stricture config before validation
 */
export interface RawStrictureConfig {
  preset?: unknown
  extends?: unknown
  boundaries?: unknown
  rules?: unknown
  overrides?: unknown
}
