/**
 * @stricture/eslint-plugin
 *
 * ESLint plugin for enforcing software architecture boundaries.
 * This is a thin wrapper around @stricture/core that integrates with ESLint.
 */

import enforceBoundaries from './rules/enforce-boundaries.js'
import type { ESLint } from 'eslint'

/**
 * Plugin definition
 */
const plugin: ESLint.Plugin = {
  meta: {
    name: '@stricture/eslint-plugin',
    version: '0.1.0'
  },
  rules: {
    'enforce-boundaries': enforceBoundaries
  },
  configs: {}
}

// Add configs after plugin is defined
// Note: For legacy ESLint (< v9) using extends: ['plugin:@stricture/recommended'],
// we should NOT include the plugin instance to avoid circular references during serialization

// Helper function to create config (ensures each config is a separate object, not readonly)
const createConfig = () => ({
  plugins: ['@stricture'],
  rules: {
    '@stricture/enforce-boundaries': 'error'
  }
})

// Type assertion needed because ESLint's Plugin.configs type is too strict
// These configs are for legacy ESLint format (< v9) with plugins as string array
plugin.configs = {
  // Recommended config - basic setup
  // Used with: extends: ['plugin:@stricture/recommended']
  recommended: createConfig(),

  // Hexagonal architecture preset config
  // Used with: extends: ['plugin:@stricture/hexagonal']
  hexagonal: createConfig(),

  // Layered architecture preset config
  // Used with: extends: ['plugin:@stricture/layered']
  layered: createConfig(),

  // Clean architecture preset config
  // Used with: extends: ['plugin:@stricture/clean']
  clean: createConfig(),

  // Modular architecture preset config
  // Used with: extends: ['plugin:@stricture/modular']
  modular: createConfig(),

  // Next.js preset config
  // Used with: extends: ['plugin:@stricture/nextjs']
  nextjs: createConfig(),

  // NestJS preset config
  // Used with: extends: ['plugin:@stricture/nestjs']
  nestjs: createConfig()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

// For flat config (ESLint v9+), export a factory function to avoid circular references
export const createFlatConfig = () => ({
  plugins: {
    '@stricture': plugin
  },
  rules: {
    '@stricture/enforce-boundaries': 'error'
  }
})

// Default export for flat config
export default plugin

// Named exports for compatibility
export { enforceBoundaries }
export const rules = {
  'enforce-boundaries': enforceBoundaries
}
export const configs = plugin.configs
