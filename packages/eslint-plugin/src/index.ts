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
plugin.configs = {
  // Recommended config for ESLint legacy format (< v9)
  // Used with: extends: ['plugin:@stricture/recommended']
  recommended: {
    plugins: ['@stricture'],
    rules: {
      '@stricture/enforce-boundaries': 'error'
    }
  }
}

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
