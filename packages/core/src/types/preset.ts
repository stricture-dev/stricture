import type { BoundaryDefinition } from './boundary.js'
import type { ArchRule } from './rule.js'
import type { DiagramDefinition, ScaffoldingTemplate } from './diagram.js'

/**
 * Complete architecture preset definition
 */
export interface ArchPreset {
  id: string // Unique preset ID (e.g., '@stricture/hexagonal')
  name: string // Display name
  description: string // What this architecture is
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  diagram?: DiagramDefinition // Visual diagram data
  scaffolding?: ScaffoldingTemplate
  metadata?: {
    version?: string
    author?: string
    url?: string
    [key: string]: unknown
  }
}
