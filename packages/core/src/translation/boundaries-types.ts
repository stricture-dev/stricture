/**
 * TypeScript types for eslint-plugin-boundaries configuration
 *
 * These types define the configuration format for eslint-plugin-boundaries
 * that we'll generate from Stricture configurations.
 */

/**
 * Element descriptor for eslint-plugin-boundaries
 */
export interface BoundariesElementDescriptor {
  /** Type identifier (e.g., "domain", "application") */
  type: string

  /** Glob pattern(s) to match files */
  pattern: string | string[]

  /** Optional category (not used by Stricture currently) */
  category?: string

  /** How to interpret the pattern */
  mode?: 'file' | 'folder' | 'full'

  /** Optional base pattern for additional path matching */
  basePattern?: string

  /** Capture groups from pattern for dynamic rules */
  capture?: string[]

  /** Capture groups from basePattern */
  baseCapture?: string[]
}

/**
 * Element selector - simple or object form
 */
export type BoundariesElementSelector =
  | string  // Simple string: "domain"
  | {
      type?: string | string[]
      category?: string | string[]
      path?: string | string[]
      elementPath?: string | string[]
      internalPath?: string | string[]
      origin?: 'local' | 'external' | 'core' | string[]
      captured?: Record<string, string | string[]>
    }
  | [string, Record<string, string>]  // Legacy format with captured values

export type BoundariesElementsSelector = BoundariesElementSelector | BoundariesElementSelector[]

/**
 * Rule for boundaries/element-types
 */
export interface BoundariesElementTypesRule {
  /** Source elements selector */
  from?: BoundariesElementsSelector

  /** Elements that are allowed to be imported */
  allow?: BoundariesElementsSelector

  /** Elements that are disallowed to be imported */
  disallow?: BoundariesElementsSelector

  /** Filter by import kind */
  importKind?: 'type' | 'value' | 'typeof' | string[]

  /** Custom message for this rule */
  message?: string
}

/**
 * Options for boundaries/element-types rule
 */
export interface BoundariesElementTypesOptions {
  /** Default policy when no rule matches */
  default?: 'allow' | 'disallow'

  /** Custom message for all violations */
  message?: string

  /** Array of dependency rules */
  rules?: BoundariesElementTypesRule[]
}

/**
 * Rule for boundaries/external
 */
export interface BoundariesExternalRule {
  /** Source elements */
  from: BoundariesElementsSelector

  /** External libraries allowed */
  allow?: BoundariesExternalLibrariesSelector

  /** External libraries disallowed */
  disallow?: BoundariesExternalLibrariesSelector

  /** Filter by import kind */
  importKind?: 'type' | 'value' | 'typeof'

  /** Custom message */
  message?: string
}

export type BoundariesExternalLibrarySelector =
  | string
  | [string, {
      path?: string | string[]
      specifiers?: string[]
    }]

export type BoundariesExternalLibrariesSelector =
  | BoundariesExternalLibrarySelector
  | BoundariesExternalLibrarySelector[]

/**
 * Options for boundaries/external rule
 */
export interface BoundariesExternalOptions {
  /** Default policy when no rule matches */
  default?: 'allow' | 'disallow'

  /** Custom message for all violations */
  message?: string

  /** Array of external dependency rules */
  rules?: BoundariesExternalRule[]
}

/**
 * Settings for eslint-plugin-boundaries
 */
export interface BoundariesSettings {
  /** Element descriptors - defines project layers/boundaries */
  'boundaries/elements'?: BoundariesElementDescriptor[]

  /** Glob patterns to ignore */
  'boundaries/ignore'?: string | string[]

  /** Glob patterns to include (if specified, only these are checked) */
  'boundaries/include'?: string | string[]

  /** Root path of project */
  'boundaries/root-path'?: string

  /** Which dependency node types to check */
  'boundaries/dependency-nodes'?: Array<'import' | 'require' | 'dynamic-import' | 'export'>

  /** Enable legacy template syntax */
  'boundaries/legacy-templates'?: boolean

  /** Enable caching */
  'boundaries/cache'?: boolean
}

/**
 * Complete ESLint configuration for boundaries
 */
export interface BoundariesESLintConfig {
  settings?: BoundariesSettings
  rules?: {
    'boundaries/element-types'?: [number, BoundariesElementTypesOptions]
    'boundaries/external'?: [number, BoundariesExternalOptions]
    'boundaries/entry-point'?: unknown
    'boundaries/no-private'?: unknown
    'boundaries/no-unknown'?: number
    'boundaries/no-unknown-files'?: number
    'boundaries/no-ignored'?: number
  }
}

/**
 * Translation context - metadata about the translation process
 */
export interface TranslationContext {
  /** Whether deny-by-default is enabled */
  denyByDefault: boolean

  /** Number of rules translated */
  rulesTranslated: number

  /** Number of boundaries translated */
  boundariesTranslated: number

  /** Warnings generated during translation */
  warnings: string[]

  /** Info about features that couldn't be perfectly translated */
  limitations: string[]
}
