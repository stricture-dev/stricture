import type { BoundaryDefinition } from './boundary.js'
import type { ArchRule } from './rule.js'

/**
 * Project configuration schema (stored in `.stricture/config.json`)
 */
export interface StrictureConfig {
  version?: string // Config version (default: '1')
  preset: string // Base preset (e.g., '@stricture/hexagonal')
  extends?: string[] // Additional presets to merge
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  overrides?: Partial<ArchRule>[] // Override specific rules
  ignorePatterns?: string[] // Global ignore patterns
  metadata?: Record<string, unknown>
}
