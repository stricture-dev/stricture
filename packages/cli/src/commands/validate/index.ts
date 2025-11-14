import path from 'path'
import type { ValidateOptions } from '../../types/cli.js'
import type { StrictureConfig } from '@stricture/core'
import { validateConfig } from '@stricture/core'
import { fileExists, readJsonFile } from '../../utils/file-utils.js'
import { logger } from '../../utils/logger.js'

/**
 * Validate configuration file
 */
export async function validate(
  options: ValidateOptions = {}
): Promise<boolean> {
  const projectRoot = process.cwd()
  const configPath =
    options.configPath ?? path.join(projectRoot, '.stricture/config.json')

  logger.log('')
  logger.heading('Validating configuration...')
  logger.log('')

  // Check if config exists
  if (!(await fileExists(configPath))) {
    logger.error('Configuration file not found')
    logger.dim(`Expected: ${configPath}`)
    logger.log('')
    logger.info('Run `stricture init` to create configuration')
    return false
  }

  // Read config
  let config: StrictureConfig
  try {
    config = await readJsonFile<StrictureConfig>(configPath)
  } catch (error) {
    logger.error('Failed to parse configuration file')
    logger.dim(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return false
  }

  // Validate config
  const validation = validateConfig(config)

  if (!validation.valid) {
    logger.error('Configuration validation failed')
    logger.log('')
    logger.dim('Errors:')
    for (const error of validation.errors) {
      logger.error(`  - ${error.message}`)
      if (options.verbose && error.path) {
        logger.dim(`    Path: ${error.path}`)
      }
    }
    logger.log('')
    return false
  }

  // Show success
  logger.success('Configuration is valid')
  logger.log('')

  if (options.verbose) {
    logger.dim('Details:')
    logger.dim(`  Preset: ${config.preset}`)
    logger.dim(`  Boundaries: ${config.boundaries.length}`)
    logger.dim(`  Rules: ${config.rules.length}`)
    logger.log('')

    logger.dim('Boundaries:')
    for (const boundary of config.boundaries) {
      logger.dim(`  - ${boundary.name}: ${boundary.pattern}`)
    }
    logger.log('')

    logger.dim('Rules:')
    for (const rule of config.rules) {
      logger.dim(`  - ${rule.id}: ${rule.name || 'Unnamed rule'}`)
    }
    logger.log('')
  } else {
    logger.dim(`Preset: ${config.preset}`)
    logger.dim(`Boundaries: ${config.boundaries.length}`)
    logger.dim(`Rules: ${config.rules.length}`)
    logger.log('')
  }

  return true
}
