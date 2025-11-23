import type { Rule } from 'eslint'
import type {
  Node,
  ImportDeclaration,
  CallExpression,
  ImportExpression,
  ExportNamedDeclaration,
  ExportAllDeclaration
} from 'estree'
import { validateImport, resolveImportPath, type StrictureConfig } from '@stricture/core'
import { loadConfig } from './utils/load-config.js'
import { loadTsconfigPaths } from './utils/load-tsconfig.js'
import { formatErrorMessage } from './utils/format-error.js'
import path from 'path'

/**
 * ESLint rule options
 */
interface RuleOptions {
  configPath?: string
  inlineConfig?: StrictureConfig
  baseUrl?: string
  checkDynamicImports?: boolean
  reportUnusedRules?: boolean
}

/**
 * Main ESLint rule: enforce-boundaries
 *
 * This is a thin wrapper around @stricture/core's validateImport() and resolveImportPath().
 * It does NOT contain validation logic - that's all in @stricture/core.
 *
 * Responsibilities:
 * 1. Extract import information from AST nodes
 * 2. Call core's resolveImportPath() to resolve import specifiers
 * 3. Call core's validateImport() to check if import is allowed
 * 4. Format and report errors to ESLint
 */
const enforceBoundariesRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce architectural boundaries',
      category: 'Possible Errors',
      recommended: true,
      url: 'https://stricture.dev/docs/rules/enforce-boundaries'
    },
    schema: [
      {
        type: 'object',
        properties: {
          configPath: { type: 'string' },
          inlineConfig: { type: 'object' },
          baseUrl: { type: 'string' },
          checkDynamicImports: { type: 'boolean' },
          reportUnusedRules: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ],
    messages: {
      boundaryViolation: '{{message}}',
      configLoadError: 'Failed to load .stricture/config.json: {{error}}'
    }
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    // Get options
    const options: RuleOptions = context.options[0] ?? {}
    const checkDynamicImports = options.checkDynamicImports !== false // default true

    // Load configuration
    // PRIORITY 1: Inline config (from config factory)
    // PRIORITY 2: File-based config
    let config: StrictureConfig
    if (options.inlineConfig) {
      config = options.inlineConfig
    } else {
      // Try loading from file
      const configPath = options.configPath ?? '.stricture/config.json'
      try {
        config = loadConfig(configPath)
      } catch (err) {
        // Report config loading error on the first node
        return {
          Program(node: Node) {
            context.report({
              node,
              messageId: 'configLoadError',
              data: {
                error:
                  'No Stricture configuration found. ' +
                  'Either use stricture.configs.hexagonal() in ESLint config ' +
                  'or create .stricture/config.json\n\n' +
                  `Original error: ${err instanceof Error ? err.message : String(err)}`
              }
            })
          }
        }
      }
    }

    // Get base directory for path resolution
    const filename = context.getFilename()
    const cwd = context.getCwd ? context.getCwd() : process.cwd()
    const baseDir = options.baseUrl ? path.resolve(cwd, options.baseUrl) : cwd

    // Load tsconfig paths for alias resolution
    const tsconfigPaths = loadTsconfigPaths(baseDir)

    // Convert tsconfig paths to format expected by core
    // tsconfig-paths returns paths like { '@core/*': ['src/core/*'] }
    // core expects the same format, so we can pass directly

    /**
     * Check an import statement
     */
    function checkImport(node: Node, importSpecifier: string | undefined) {
      if (!importSpecifier || typeof importSpecifier !== 'string') {
        return
      }

      const sourceFile = filename

      // Resolve import path using core
      const resolvedPath = resolveImportPath(
        sourceFile,
        importSpecifier,
        baseDir,
        tsconfigPaths ?? undefined
      )

      // Validate import using core
      const result = validateImport(
        sourceFile,
        resolvedPath,
        config.rules,
        config.boundaries
      )

      // Report if invalid
      if (!result.valid) {
        // Skip rules with severity 'off'
        if (result.violatedRule?.severity === 'off') {
          return
        }

        const message = formatErrorMessage(result)

        // Prepend severity indicator for warnings
        const severityPrefix = result.violatedRule?.severity === 'warn' ? '[WARNING] ' : ''
        const fullMessage = severityPrefix + message

        context.report({
          node,
          messageId: 'boundaryViolation',
          data: {
            message: fullMessage
          }
        })
      }
    }

    // Return AST visitors
    return {
      // Static imports: import X from 'Y'
      ImportDeclaration(node: ImportDeclaration) {
        const importSpecifier = node.source?.value
        if (typeof importSpecifier === 'string') {
          checkImport(node, importSpecifier)
        }
      },

      // require()
      CallExpression(node: CallExpression) {
        // Only process SimpleCallExpression (not NewExpression)
        if (node.type !== 'CallExpression') {
          return
        }

        // Check require('X')
        if (
          node.callee?.type === 'Identifier' &&
          node.callee?.name === 'require' &&
          node.arguments &&
          node.arguments.length > 0
        ) {
          const arg = node.arguments[0]
          if (arg && arg.type === 'Literal') {
            const importSpecifier = arg.value
            if (typeof importSpecifier === 'string') {
              checkImport(node, importSpecifier)
            }
          }
        }
      },

      // Dynamic imports: import('X')
      ImportExpression(node: ImportExpression) {
        if (checkDynamicImports && node.source) {
          const importSpecifier = node.source.type === 'Literal' ? node.source.value : undefined
          if (typeof importSpecifier === 'string') {
            checkImport(node, importSpecifier)
          }
        }
      },

      // Re-exports: export { X } from 'Y'
      ExportNamedDeclaration(node: ExportNamedDeclaration) {
        if (node.source) {
          const importSpecifier = node.source.value
          if (typeof importSpecifier === 'string') {
            checkImport(node, importSpecifier)
          }
        }
      },

      // Export all: export * from 'Y'
      ExportAllDeclaration(node: ExportAllDeclaration) {
        const importSpecifier = node.source?.value
        if (typeof importSpecifier === 'string') {
          checkImport(node, importSpecifier)
        }
      }
    }
  }
}

export default enforceBoundariesRule
