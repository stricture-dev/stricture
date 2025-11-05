import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import rule from '../../src/rules/enforce-boundaries.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Setup RuleTester
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
})

const configPath = path.join(__dirname, '../fixtures/configs/simple-config.json')

describe('enforce-boundaries rule', () => {
  it('should validate imports according to configured rules', () => {
    ruleTester.run('enforce-boundaries', rule, {
      valid: [
        // Domain can import from itself (if no rule blocks it)
        {
          code: "import { User } from './user'",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath }]
        },
        // Adapters can import from ports
        {
          code: "import { UserPort } from '../../core/ports/user-port'",
          filename: '/test/src/adapters/api/user-controller.ts',
          options: [{ configPath }]
        },
        // Application can import from domain
        {
          code: "import { User } from '../domain/user'",
          filename: '/test/src/core/application/user-service.ts',
          options: [{ configPath }]
        }
      ],
      invalid: [
        // Domain cannot import from adapters (violates domain-isolation)
        {
          code: "import { api } from '../../adapters/api'",
          filename: '/test/src/core/domain/user.ts',
          options: [{ configPath }],
          errors: [
            {
              message: /Domain layer must remain pure/
            }
          ]
        },
        // Adapters cannot import from domain directly
        {
          code: "import { User } from '../../core/domain/user'",
          filename: '/test/src/adapters/api/user-controller.ts',
          options: [{ configPath }],
          errors: [
            {
              message: /Adapters must access domain through ports/
            }
          ]
        }
      ]
    })
  })

  it('should handle require() statements', () => {
    ruleTester.run('enforce-boundaries require', rule, {
      valid: [
        {
          code: "const User = require('./user')",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath }]
        }
      ],
      invalid: [
        {
          code: "const api = require('../../adapters/api')",
          filename: '/test/src/core/domain/user.ts',
          options: [{ configPath }],
          errors: [
            {
              message: /Domain layer must remain pure/
            }
          ]
        }
      ]
    })
  })

  it('should handle dynamic imports when checkDynamicImports is true', () => {
    ruleTester.run('enforce-boundaries dynamic', rule, {
      valid: [
        {
          code: "const module = await import('./user')",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath, checkDynamicImports: true }]
        }
      ],
      invalid: [
        {
          code: "const api = await import('../../adapters/api')",
          filename: '/test/src/core/domain/user.ts',
          options: [{ configPath, checkDynamicImports: true }],
          errors: [
            {
              message: /Domain layer must remain pure/
            }
          ]
        }
      ]
    })
  })

  it('should handle export statements', () => {
    ruleTester.run('enforce-boundaries exports', rule, {
      valid: [
        {
          code: "export { User } from './user'",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath }]
        }
      ],
      invalid: [
        {
          code: "export { api } from '../../adapters/api'",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath }],
          errors: [
            {
              message: /Domain layer must remain pure/
            }
          ]
        },
        {
          code: "export * from '../../adapters/api'",
          filename: '/test/src/core/domain/index.ts',
          options: [{ configPath }],
          errors: [
            {
              message: /Domain layer must remain pure/
            }
          ]
        }
      ]
    })
  })

  it('should handle missing config file gracefully', () => {
    ruleTester.run('enforce-boundaries missing config', rule, {
      valid: [],
      invalid: [
        {
          code: "import { User } from './user'",
          filename: '/test/src/domain/user.ts',
          options: [{ configPath: '/nonexistent/config.json' }],
          errors: [
            {
              message: /Config file not found/
            }
          ]
        }
      ]
    })
  })
})
