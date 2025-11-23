/**
 * @stricture/eslint-plugin
 *
 * ESLint plugin for enforcing software architecture boundaries.
 * This is a thin wrapper around @stricture/core that integrates with ESLint.
 */

import enforceBoundaries from './rules/enforce-boundaries.js'
import { createConfigFactory, createConfig, createConfigFromFile } from './configs/factory.js'
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
// These are now factory functions that support inline configuration

// Type assertion needed because ESLint's Plugin.configs type is too strict
plugin.configs = {
  // Recommended config - basic setup (reads .stricture/config.json)
  // Used with: stricture.configs.recommended()
  recommended: createConfigFactory(),

  // Hexagonal architecture preset config
  // Used with: stricture.configs.hexagonal()
  hexagonal: createConfigFactory('@stricture/hexagonal'),

  // Layered architecture preset config
  // Used with: stricture.configs.layered()
  layered: createConfigFactory('@stricture/layered'),

  // Clean architecture preset config
  // Used with: stricture.configs.clean()
  clean: createConfigFactory('@stricture/clean'),

  // Modular architecture preset config
  // Used with: stricture.configs.modular()
  modular: createConfigFactory('@stricture/modular'),

  // Next.js preset config
  // Used with: stricture.configs.nextjs()
  nextjs: createConfigFactory('@stricture/nextjs'),

  // NestJS preset config
  // Used with: stricture.configs.nestjs()
  nestjs: createConfigFactory('@stricture/nestjs')
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

// Export config helpers for custom presets
export { createConfig, createConfigFromFile }

// Export bundled presets for advanced usage
export {
  hexagonalPreset,
  layeredPreset,
  cleanPreset,
  modularPreset,
  nextjsPreset,
  nestjsPreset
} from './presets/index.js'
