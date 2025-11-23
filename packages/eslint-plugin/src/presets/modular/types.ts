/**
 * Type helpers for Modular Architecture
 */

/**
 * Module definition with public API
 */
export interface Module {
  /**
   * Module name (matches directory name)
   */
  readonly name: string

  /**
   * Public API exports (what other modules can import)
   */
  readonly publicAPI: Record<string, unknown>
}

/**
 * Feature module marker interface
 */
export interface FeatureModule extends Module {
  // Marker interface for feature modules
}

/**
 * Shared utility marker interface
 */
export interface SharedUtility {
  // Marker interface for shared utilities
}

/**
 * Public API type helper - ensures module exports are explicit
 */
export type PublicAPI<T> = {
  [K in keyof T]: T[K]
}

/**
 * Module dependency type
 */
export interface ModuleDependency {
  readonly module: string
  readonly importedFrom: 'public-api' | 'shared'
}

/**
 * Module metadata
 */
export interface ModuleMetadata {
  readonly name: string
  readonly description?: string
  readonly version?: string
  readonly dependencies?: ModuleDependency[]
}
