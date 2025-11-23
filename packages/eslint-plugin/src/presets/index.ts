/**
 * Bundled architecture presets
 *
 * All official Stricture presets are bundled with the ESLint plugin
 * for convenience and simplicity.
 */

export { default as hexagonalPreset } from './hexagonal/index.js'
export { default as layeredPreset } from './layered/index.js'
export { default as cleanPreset } from './clean/index.js'
export { default as modularPreset } from './modular/index.js'
export { default as nextjsPreset } from './nextjs/index.js'
export { default as nestjsPreset } from './nestjs/index.js'

// Re-export types from core
export type { ArchPreset, StrictureConfig } from '@stricture/core'
