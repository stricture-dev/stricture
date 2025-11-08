/**
 * @stricture/cli
 *
 * Interactive command-line interface for managing Stricture architecture enforcement.
 *
 * This package provides commands for initializing, validating, and checking
 * architecture boundaries in your projects.
 */

// Export command functions for programmatic usage
export { init } from './commands/init/index.js'
export { check } from './commands/check/index.js'
export { validate } from './commands/validate/index.js'
export { diagram } from './commands/diagram/index.js'
export { scaffold } from './commands/scaffold/index.js'
export { fix } from './commands/fix/index.js'

// Export types
export type {
  InitOptions,
  CheckOptions,
  ValidateOptions,
  DiagramOptions,
  ScaffoldOptions,
  FixOptions,
  ProjectInfo,
  DirectoryStructure,
  CheckResult,
  Violation,
  PresetInfo
} from './types/cli.js'

// Export utilities
export { logger } from './utils/logger.js'
export { createSpinner, withSpinner } from './utils/spinner.js'
export {
  fileExists,
  directoryExists,
  readJsonFile,
  writeJsonFile,
  ensureDir,
  findFiles,
  readPackageJson
} from './utils/file-utils.js'
export {
  PRESET_REGISTRY,
  getPresetInfo,
  getRecommendedPresets,
  loadPreset
} from './utils/preset-registry.js'
