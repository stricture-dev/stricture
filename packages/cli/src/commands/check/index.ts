import path from 'path'
import type { CheckOptions, CheckResult } from '../../types/cli.js'
import type { StrictureConfig } from '@stricture/core'
import { validateConfig } from '@stricture/core'
import { scanFiles } from './scan-files.js'
import { checkFile } from './validate-imports.js'
import { formatViolations, displaySummary } from './format-results.js'
import { fileExists, readJsonFile } from '../../utils/file-utils.js'
import { logger } from '../../utils/logger.js'
import { createSpinner } from '../../utils/spinner.js'

/**
 * Check for architecture violations
 */
export async function check(
  options: CheckOptions = {}
): Promise<CheckResult> {
  const projectRoot = process.cwd()
  const configPath =
    options.configPath ?? path.join(projectRoot, '.stricture/config.json')

  // 1. Load and validate config
  const spinner = createSpinner('Loading configuration...').start()

  if (!(await fileExists(configPath))) {
    spinner.fail('Configuration not found')
    logger.error(
      `Could not find .stricture/config.json. Run 'stricture init' first.`
    )
    return createEmptyResult()
  }

  const config = await readJsonFile<StrictureConfig>(configPath)
  const validation = validateConfig(config)

  if (!validation.valid) {
    spinner.fail('Invalid configuration')
    logger.error('Configuration validation errors:')
    for (const error of validation.errors) {
      logger.error(`  - ${error.message}`)
    }
    return createEmptyResult()
  }

  spinner.succeed('Configuration loaded')

  // 2. Scan project files
  spinner.text = 'Scanning files...'
  spinner.start()
  const files = await scanFiles(projectRoot, config.ignorePatterns)
  spinner.succeed(`Scanned ${files.length} files`)

  // 3. Check each file
  spinner.text = 'Checking imports...'
  spinner.start()

  const violations = []
  let filesChecked = 0

  for (const file of files) {
    const fileViolations = await checkFile(file, config, projectRoot)
    violations.push(...fileViolations)
    filesChecked++

    if (options.verbose && filesChecked % 10 === 0) {
      spinner.text = `Checking imports... (${filesChecked}/${files.length})`
    }
  }

  spinner.stop()

  // 4. Format and display results
  const result: CheckResult = {
    valid: violations.length === 0,
    violations,
    summary: {
      totalFiles: files.length,
      filesChecked,
      violationsFound: violations.length,
      boundariesDefined: config.boundaries.length,
      rulesLoaded: config.rules.length
    }
  }

  if (violations.length > 0) {
    logger.log('')
    logger.error(
      `Found ${violations.length} violation${violations.length === 1 ? '' : 's'}:`
    )
    formatViolations(violations, options.format)
  }

  displaySummary(result)

  return result
}

/**
 * Create an empty result (for errors)
 */
function createEmptyResult(): CheckResult {
  return {
    valid: false,
    violations: [],
    summary: {
      totalFiles: 0,
      filesChecked: 0,
      violationsFound: 0,
      boundariesDefined: 0,
      rulesLoaded: 0
    }
  }
}
