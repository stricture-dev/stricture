import { describe, it, expect } from 'vitest'
import { formatErrorMessage } from '../../../src/rules/utils/format-error.js'
import type { ImportValidationResult } from '@stricture/core'

describe('formatErrorMessage', () => {
  it('should format a basic error message', () => {
    const result: ImportValidationResult = {
      valid: false,
      fromBoundary: 'domain',
      toBoundary: 'adapters',
      message: "Domain cannot import from adapters"
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toContain('Domain cannot import from adapters')
  })

  it('should include violated rule information when present', () => {
    const result: ImportValidationResult = {
      valid: false,
      fromBoundary: 'domain',
      toBoundary: 'adapters',
      message: "Domain cannot import from adapters",
      violatedRule: {
        id: 'domain-isolation',
        name: 'Domain Isolation',
        description: 'Domain must remain pure',
        severity: 'error',
        from: { tag: 'domain' },
        to: { tag: '*' },
        allowed: false
      }
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toContain('Domain cannot import from adapters')
    expect(formatted).toContain('Rule: Domain Isolation')
    expect(formatted).toContain('(domain-isolation)')
  })

  it('should include suggestion when present', () => {
    const result: ImportValidationResult = {
      valid: false,
      fromBoundary: 'domain',
      toBoundary: 'adapters',
      message: "Domain cannot import from adapters",
      suggestion: 'Create a port interface instead'
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toContain('Suggestion: Create a port interface instead')
  })

  it('should include good examples when present in rule', () => {
    const result: ImportValidationResult = {
      valid: false,
      fromBoundary: 'domain',
      toBoundary: 'adapters',
      message: "Domain cannot import from adapters",
      violatedRule: {
        id: 'domain-isolation',
        name: 'Domain Isolation',
        description: 'Domain must remain pure',
        severity: 'error',
        from: { tag: 'domain' },
        to: { tag: '*' },
        allowed: false,
        examples: {
          good: [
            "import { User } from './user'",
            "import { Email } from './value-objects/email'"
          ],
          bad: [
            "import { api } from '../../adapters/api'"
          ]
        }
      }
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toContain('Allowed:')
    expect(formatted).toContain("import { User } from './user'")
    expect(formatted).toContain("import { Email } from './value-objects/email'")
  })

  it('should handle missing optional fields gracefully', () => {
    const result: ImportValidationResult = {
      valid: false,
      message: 'Import not allowed'
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toBe('Import not allowed')
  })

  it('should return a concise message for valid results (should not be called)', () => {
    const result: ImportValidationResult = {
      valid: true
    }

    const formatted = formatErrorMessage(result)

    // Even though this shouldn't be called for valid results,
    // we should handle it gracefully
    expect(formatted).toBe('')
  })

  it('should format external dependency errors', () => {
    const result: ImportValidationResult = {
      valid: false,
      fromBoundary: 'domain',
      toBoundary: 'external',
      message: "'domain' cannot import external dependencies",
      suggestion: 'Consider using dependency injection'
    }

    const formatted = formatErrorMessage(result)

    expect(formatted).toContain("'domain' cannot import external dependencies")
    expect(formatted).toContain('Suggestion: Consider using dependency injection')
  })
})
