import type { BoundaryDefinition, ArchRule } from '@stricture/core'

/**
 * Options for the init command
 */
export interface InitOptions {
  preset?: string // Preset to use (e.g., '@stricture/hexagonal')
  projectRoot?: string // Project root directory
  yes?: boolean // Accept all defaults without prompting
  install?: boolean // Install dependencies
  interactive?: boolean // Enable interactive mode
}

/**
 * Options for the check command
 */
export interface CheckOptions {
  configPath?: string // Path to config file
  fix?: boolean // Auto-fix violations
  format?: 'text' | 'json' | 'checkstyle' // Output format
  verbose?: boolean // Verbose output
}

/**
 * Options for the validate command
 */
export interface ValidateOptions {
  configPath?: string // Path to config file
  verbose?: boolean // Verbose output
}

/**
 * Options for the diagram command
 */
export interface DiagramOptions {
  configPath?: string // Path to config file
  output?: string // Output file path
  format?: 'mermaid' | 'svg' | 'ascii' // Diagram format
}

/**
 * Options for the scaffold command
 */
export interface ScaffoldOptions {
  configPath?: string // Path to config file
  force?: boolean // Overwrite existing files
  examples?: boolean // Include example files
}

/**
 * Options for the fix command
 */
export interface FixOptions {
  configPath?: string // Path to config file
  verbose?: boolean // Verbose output
}

/**
 * Information about the project
 */
export interface ProjectInfo {
  root: string
  framework?: 'nextjs' | 'nestjs' | 'react' | 'vue' | 'express' | 'unknown'
  hasTypeScript: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm'
  srcDirectory: string
  structure: DirectoryStructure
}

/**
 * Directory structure information
 */
export interface DirectoryStructure {
  directories: string[]
  suggestedBoundaries: BoundaryDefinition[]
}

/**
 * Result from the check command
 */
export interface CheckResult {
  valid: boolean
  violations: Violation[]
  summary: {
    totalFiles: number
    filesChecked: number
    violationsFound: number
    boundariesDefined: number
    rulesLoaded: number
  }
}

/**
 * A single violation
 */
export interface Violation {
  file: string
  line: number
  column: number
  rule: ArchRule
  from: BoundaryDefinition | null
  to: BoundaryDefinition | null
  message: string
}

/**
 * Available presets in the registry
 */
export interface PresetInfo {
  id: string
  name: string
  description: string
  installed: boolean
  recommended?: boolean
}
