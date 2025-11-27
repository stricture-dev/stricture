/**
 * @stricture/core
 *
 * Core types, interfaces, and utilities for Stricture architecture boundary enforcement.
 *
 * This package provides the foundational types and validation logic that all other
 * Stricture packages depend on.
 */

// Types
export type { ArchRule } from './types/rule.js'
export type { BoundaryPattern, BoundaryDefinition } from './types/boundary.js'
export type { ArchPreset } from './types/preset.js'
export type { StrictureConfig } from './types/config.js'
export type { DiagramDefinition, ScaffoldingTemplate } from './types/diagram.js'
export type {
  ValidationResult,
  ValidationError,
  ImportValidationResult
} from './types/validation.js'

// Validation functions
export { validateConfig } from './validation/validate-config.js'
export { validateRule } from './validation/validate-rule.js'
export { validateBoundary } from './validation/validate-boundary.js'
export { validateImport } from './validation/validate-import.js'

// Resolution functions
export { resolveImportPath } from './resolution/resolve-import.js'

// Matching functions
export { matchesPattern } from './matching/match-pattern.js'

// Merging functions
export { mergeBoundaries } from './merging/merge-boundaries.js'
export { mergeRules } from './merging/merge-rules.js'
export { resolveConfig } from './merging/resolve-config.js'

// Translation functions (for eslint-plugin-boundaries integration)
export { translateConfig, generateTranslationReport } from './translation/translate-config.js'
export { translateBoundaries, createTagToBoundaryMap } from './translation/translate-boundaries.js'
export { translateRules } from './translation/translate-rules.js'
export type {
  BoundariesElementDescriptor,
  BoundariesElementsSelector,
  BoundariesElementTypesRule,
  BoundariesElementTypesOptions,
  BoundariesExternalRule,
  BoundariesExternalOptions,
  BoundariesSettings,
  BoundariesESLintConfig,
  TranslationContext
} from './translation/boundaries-types.js'
