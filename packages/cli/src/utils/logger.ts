import chalk from 'chalk'

/**
 * Logger utility for consistent colored output
 */
export const logger = {
  /**
   * Log a success message
   */
  success(message: string): void {
    console.log(chalk.green('✓'), message)
  },

  /**
   * Log an error message
   */
  error(message: string): void {
    console.error(chalk.red('✗'), message)
  },

  /**
   * Log a warning message
   */
  warn(message: string): void {
    console.warn(chalk.yellow('⚠'), message)
  },

  /**
   * Log an info message
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message)
  },

  /**
   * Log a plain message
   */
  log(message: string): void {
    console.log(message)
  },

  /**
   * Log a dim/gray message
   */
  dim(message: string): void {
    console.log(chalk.gray(message))
  },

  /**
   * Log a heading
   */
  heading(message: string): void {
    console.log(chalk.bold.cyan(message))
  }
}
