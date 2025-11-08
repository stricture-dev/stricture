import { promises as fs } from 'fs'
import type { StrictureConfig, ImportValidationResult } from '@stricture/core'
import { validateImport, resolveImportPath } from '@stricture/core'
import type { Violation } from '../../types/cli.js'

/**
 * Check a single file for violations
 */
export async function checkFile(
  filePath: string,
  config: StrictureConfig,
  projectRoot: string = process.cwd()
): Promise<Violation[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const violations: Violation[] = []

  // Parse imports from file
  const imports = parseImports(content)

  for (const imp of imports) {
    try {
      // Resolve import path
      const resolvedPath = resolveImportPath(
        imp.source,
        filePath,
        projectRoot
      )

      // Validate import
      const result: ImportValidationResult = validateImport(
        filePath,
        resolvedPath,
        config.rules,
        config.boundaries
      )

      if (!result.valid && result.violatedRule) {
        // Find boundary definitions by name
        const fromBoundary = result.fromBoundary
          ? config.boundaries.find((b) => b.name === result.fromBoundary) ?? null
          : null
        const toBoundary = result.toBoundary
          ? config.boundaries.find((b) => b.name === result.toBoundary) ?? null
          : null

        violations.push({
          file: filePath,
          line: imp.line,
          column: imp.column,
          rule: result.violatedRule,
          from: fromBoundary,
          to: toBoundary,
          message: result.message || 'Import not allowed'
        })
      }
    } catch (error) {
      // Skip resolution errors (e.g., external modules, node built-ins)
      continue
    }
  }

  return violations
}

/**
 * Parse import statements from file content
 */
function parseImports(
  content: string
): Array<{ source: string; line: number; column: number }> {
  const imports: Array<{ source: string; line: number; column: number }> = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const lineNumber = i + 1

    // Match import statements
    const importMatch =
      /import\s+(?:(?:[\w*{}\s,]+)\s+from\s+)?['"]([^'"]+)['"]/g
    const requireMatch = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g

    let match

    // ES6 imports
    while ((match = importMatch.exec(line)) !== null) {
      const source = match[1]
      if (source) {
        imports.push({
          source,
          line: lineNumber,
          column: match.index
        })
      }
    }

    // CommonJS requires
    while ((match = requireMatch.exec(line)) !== null) {
      const source = match[1]
      if (source) {
        imports.push({
          source,
          line: lineNumber,
          column: match.index
        })
      }
    }
  }

  return imports
}
