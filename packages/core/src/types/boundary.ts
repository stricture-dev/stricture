/**
 * Defines how to match files against boundaries
 */
export interface BoundaryPattern {
  pattern?: string // Glob pattern (e.g., 'src/domain/**/*.ts')
  tag?: string // Tag reference (e.g., 'domain')
  mode: 'file' | 'folder' // Match individual files or whole folders
  exclude?: string[] // Exclusion patterns
}

/**
 * Defines a named boundary in the architecture
 */
export interface BoundaryDefinition {
  name: string // Boundary name (e.g., 'domain', 'adapters')
  pattern: string // Glob pattern for files
  mode: 'file' | 'folder' // Matching mode
  tags?: string[] // Tags for this boundary
  exclude?: string[] // Patterns to exclude
  metadata?: {
    description?: string
    layer?: number // For layered architectures
    [key: string]: unknown
  }
}
