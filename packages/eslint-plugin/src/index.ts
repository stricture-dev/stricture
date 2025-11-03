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

// Add configs after plugin is defined to avoid circular reference
plugin.configs = {
  // Recommended config for ESLint flat config (v9+)
  recommended: {
    plugins: {
      '@stricture': plugin
    },
    rules: {
      '@stricture/enforce-boundaries': 'error'
    }
  },

  // Legacy config for ESLint < 9
  'recommended-legacy': {
    plugins: ['@stricture'],
    rules: {
      '@stricture/enforce-boundaries': 'error'
    }
  }
}

// Default export for flat config
export default plugin

// Named exports for compatibility
export { enforceBoundaries }
export const rules = {
  'enforce-boundaries': enforceBoundaries
}
export const configs = plugin.configs
