#!/usr/bin/env node
import { CliAdapter } from './src/adapters/driving/cli.js'

/**
 * Main entry point
 *
 * This file:
 * - Creates the CLI adapter
 * - Passes command-line arguments
 * - Kicks off the application
 */
const cli = new CliAdapter()
const args = process.argv.slice(2)

cli.run(args).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
