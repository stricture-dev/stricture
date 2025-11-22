#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init/index.js'
import { check } from './commands/check/index.js'
import { validate } from './commands/validate/index.js'
import { diagram } from './commands/diagram/index.js'
import { scaffold } from './commands/scaffold/index.js'
import { fix } from './commands/fix/index.js'
import { logger } from './utils/logger.js'

const program = new Command()

program
  .name('stricture')
  .description('Interactive CLI for managing Stricture architecture enforcement')
  .version('0.1.0')

// Init command
program
  .command('init')
  .description('Initialize Stricture in your project')
  .option('--preset <preset>', 'Architecture preset to use')
  .option('--yes', 'Accept all defaults without prompting')
  .option('--no-install', "Don't install dependencies")
  .action(async (options) => {
    try {
      await init({
        preset: options.preset,
        yes: options.yes,
        install: options.install !== false
      })
    } catch (error) {
      logger.error(
        `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Check command
program
  .command('check')
  .description('Check for architecture violations')
  .option('--config <path>', 'Path to config file')
  .option('--fix', 'Auto-fix violations (where possible)')
  .option(
    '--format <format>',
    'Output format (text, json, checkstyle)',
    'text'
  )
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const result = await check({
        configPath: options.config,
        fix: options.fix,
        format: options.format as 'text' | 'json' | 'checkstyle',
        verbose: options.verbose
      })

      // Exit with error code if violations found
      if (!result.valid) {
        process.exit(1)
      }
    } catch (error) {
      logger.error(
        `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Validate command
program
  .command('validate')
  .description('Validate configuration file')
  .option('--config <path>', 'Path to config file')
  .option('--verbose', 'Verbose output')
  .option('--structure', 'Check if project structure matches preset')
  .action(async (options) => {
    try {
      const valid = await validate({
        configPath: options.config,
        verbose: options.verbose,
        structure: options.structure
      })

      if (!valid) {
        process.exit(1)
      }
    } catch (error) {
      logger.error(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Diagram command
program
  .command('diagram')
  .description('Generate architecture diagram')
  .option('--config <path>', 'Path to config file')
  .option('--output <file>', 'Output file path')
  .option('--format <format>', 'Diagram format (mermaid, ascii, svg)', 'mermaid')
  .action(async (options) => {
    try {
      await diagram({
        configPath: options.config,
        output: options.output,
        format: options.format as 'mermaid' | 'ascii' | 'svg'
      })
    } catch (error) {
      logger.error(
        `Diagram generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Scaffold command
program
  .command('scaffold')
  .description('Generate directory structure based on configuration')
  .option('--config <path>', 'Path to config file')
  .option('--force', 'Overwrite existing files')
  .option('--examples', 'Include example files')
  .action(async (options) => {
    try {
      await scaffold({
        configPath: options.config,
        force: options.force,
        examples: options.examples
      })
    } catch (error) {
      logger.error(
        `Scaffolding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Fix command
program
  .command('fix')
  .description('Auto-fix violations (where possible)')
  .option('--config <path>', 'Path to config file')
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    try {
      await fix({
        configPath: options.config,
        verbose: options.verbose
      })
    } catch (error) {
      logger.error(
        `Fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      process.exit(1)
    }
  })

// Parse arguments
program.parse()
