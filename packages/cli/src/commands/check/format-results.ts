import chalk from 'chalk'
import type { Violation, CheckResult } from '../../types/cli.js'
import { logger } from '../../utils/logger.js'

/**
 * Format violations for display
 */
export function formatViolations(
  violations: Violation[],
  format: 'text' | 'json' | 'checkstyle' = 'text'
): void {
  switch (format) {
    case 'json':
      formatJson(violations)
      break
    case 'checkstyle':
      formatCheckstyle(violations)
      break
    case 'text':
    default:
      formatText(violations)
      break
  }
}

/**
 * Format violations as text (default)
 */
function formatText(violations: Violation[]): void {
  // Group violations by file
  const byFile = groupByFile(violations)

  for (const [file, fileViolations] of Object.entries(byFile)) {
    logger.log('')
    logger.log(chalk.underline(file))

    for (const violation of fileViolations) {
      const location = chalk.dim(`:${violation.line}:${violation.column}`)
      const rule = chalk.yellow(violation.rule.name || violation.rule.id)
      const message = violation.message

      logger.log(`  ${location}`)
      logger.log(`    ${chalk.red('✗')} ${message}`)
      logger.log(`    ${chalk.dim('Rule:')} ${rule}`)
    }
  }
}

/**
 * Format violations as JSON
 */
function formatJson(violations: Violation[]): void {
  const output = violations.map((v) => ({
    file: v.file,
    line: v.line,
    column: v.column,
    ruleId: v.rule.id,
    ruleName: v.rule.name,
    message: v.message,
    severity: v.rule.severity || 'error',
    from: v.from?.name,
    to: v.to?.name
  }))

  console.log(JSON.stringify(output, null, 2))
}

/**
 * Format violations as Checkstyle XML
 */
function formatCheckstyle(violations: Violation[]): void {
  const byFile = groupByFile(violations)

  console.log('<?xml version="1.0" encoding="UTF-8"?>')
  console.log('<checkstyle version="8.0">')

  for (const [file, fileViolations] of Object.entries(byFile)) {
    console.log(`  <file name="${escapeXml(file)}">`)

    for (const violation of fileViolations) {
      const severity = violation.rule.severity || 'error'
      console.log(
        `    <error line="${violation.line}" column="${violation.column}" severity="${severity}" message="${escapeXml(violation.message)}" source="${escapeXml(violation.rule.id)}" />`
      )
    }

    console.log('  </file>')
  }

  console.log('</checkstyle>')
}

/**
 * Display check result summary
 */
export function displaySummary(result: CheckResult): void {
  logger.log('')
  logger.log(chalk.bold('Summary:'))
  logger.log(`  Files checked: ${result.summary.filesChecked}`)
  logger.log(`  Boundaries defined: ${result.summary.boundariesDefined}`)
  logger.log(`  Rules loaded: ${result.summary.rulesLoaded}`)
  logger.log(
    `  Violations found: ${chalk[result.valid ? 'green' : 'red'](result.summary.violationsFound)}`
  )
  logger.log('')

  if (result.valid) {
    logger.success('No violations found!')
  } else {
    logger.error(
      `${result.summary.violationsFound} violation${result.summary.violationsFound === 1 ? '' : 's'} found`
    )
  }
}

/**
 * Group violations by file
 */
function groupByFile(violations: Violation[]): Record<string, Violation[]> {
  const grouped: Record<string, Violation[]> = {}

  for (const violation of violations) {
    if (!grouped[violation.file]) {
      grouped[violation.file] = []
    }
    grouped[violation.file]?.push(violation)
  }

  return grouped
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
