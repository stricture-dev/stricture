import path from 'path'
import type {
  ValidateOptions,
  BoundaryCheckResult,
  StructureValidationResult
} from '../../types/cli.js'
import type { StrictureConfig } from '@stricture/core'
import { validateConfig } from '@stricture/core'
import {
  fileExists,
  readJsonFile,
  directoryExists
} from '../../utils/file-utils.js'
import { logger } from '../../utils/logger.js'
import chalk from 'chalk'

/**
 * Extract base directory from a glob pattern
 * 'src/core/domain/**' -> 'src/core/domain'
 * 'src/adapters/driving/**\/*.ts' -> 'src/adapters/driving'
 */
function extractBaseDirectory(pattern: string): string {
  return pattern
    .replace(/\/\*\*.*$/, '') // Remove /** and everything after
    .replace(/\/\*.*$/, '') // Remove /* and everything after
    .replace(/\*.*$/, '') // Remove remaining wildcards
}

/**
 * Validate project structure matches preset expectations
 */
async function validateStructure(
  config: StrictureConfig,
  projectRoot: string
): Promise<StructureValidationResult> {
  const results: BoundaryCheckResult[] = []

  // Extract expected directories from boundary patterns
  for (const boundary of config.boundaries) {
    // Extract base directory from pattern
    const baseDir = extractBaseDirectory(boundary.pattern)
    const fullPath = path.join(projectRoot, baseDir)

    // Check if directory exists
    const exists = await directoryExists(fullPath)

    const result: BoundaryCheckResult = {
      boundary: boundary.name,
      pattern: boundary.pattern,
      expectedPath: baseDir,
      exists
    }

    if (boundary.metadata?.description) {
      result.description = boundary.metadata.description
    }

    results.push(result)
  }

  // Determine overall validity
  const allExist = results.every((r) => r.exists)
  const someExist = results.some((r) => r.exists)

  return {
    valid: allExist,
    partial: someExist && !allExist,
    boundaries: results,
    missingCount: results.filter((r) => !r.exists).length
  }
}

/**
 * Validate configuration file
 */
export async function validate(
  options: ValidateOptions = {}
): Promise<boolean> {
  const projectRoot = options.projectRoot ?? process.cwd()
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

  // Structure validation
  if (options.structure) {
    logger.heading('Checking project structure...')
    logger.log('')

    const structureResult = await validateStructure(config, projectRoot)

    // Display results
    logger.dim(`Preset: ${config.preset}`)
    logger.dim('Expected boundaries:')
    logger.log('')

    for (const boundary of structureResult.boundaries) {
      const status = boundary.exists ? '✓' : '✗'
      const color = boundary.exists ? chalk.green : chalk.red
      logger.log(
        color(`  ${status} ${boundary.expectedPath}/ (${boundary.boundary})`)
      )

      if (options.verbose && boundary.description) {
        logger.dim(`    ${boundary.description}`)
      }
    }

    logger.log('')

    if (!structureResult.valid) {
      if (structureResult.partial) {
        logger.warn(
          `Warning: ${structureResult.missingCount} expected ${
            structureResult.missingCount === 1 ? 'directory is' : 'directories are'
          } missing.`
        )
      } else {
        logger.error('No expected directories found.')
      }
      logger.log('')
      logger.info("Suggestion: Run 'stricture scaffold' to create the expected structure.")
      logger.log('')
      return false
    }

    logger.success('Project structure matches preset expectations')
    logger.log('')
  }

  return true
}
