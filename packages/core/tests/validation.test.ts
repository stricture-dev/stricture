import { describe, test, expect } from 'vitest'
import { validateBoundary, validateRule, validateConfig, validateImport } from '../src/index.js'
import type { ArchRule, BoundaryDefinition, StrictureConfig } from '../src/index.js'

describe('validateBoundary', () => {
  test('validates correct boundary definition', () => {
    const boundary: BoundaryDefinition = {
      name: 'domain',
      pattern: 'src/domain/**/*.ts',
      mode: 'file'
    }

    const result = validateBoundary(boundary)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('fails when name is missing', () => {
    const boundary = {
      pattern: 'src/domain/**/*.ts',
      mode: 'file'
    }

    const result = validateBoundary(boundary)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_REQUIRED_FIELD',
        path: 'name'
      })
    )
  })

  test('fails when pattern is missing', () => {
    const boundary = {
      name: 'domain',
      mode: 'file'
    }

    const result = validateBoundary(boundary)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_REQUIRED_FIELD',
        path: 'pattern'
      })
    )
  })

  test('fails when mode is invalid', () => {
    const boundary = {
      name: 'domain',
      pattern: 'src/domain/**/*.ts',
      mode: 'invalid'
    }

    const result = validateBoundary(boundary)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_MODE'
      })
    )
  })
})

describe('validateRule', () => {
  test('validates correct rule', () => {
    const rule: ArchRule = {
      id: 'domain-isolation',
      name: 'Domain Isolation',
      description: 'Domain cannot import from adapters',
      severity: 'error',
      from: { pattern: 'src/domain/**', mode: 'file' },
      to: { pattern: 'src/adapters/**', mode: 'file' },
      allowed: false
    }

    const result = validateRule(rule)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('fails when id is missing', () => {
    const rule = {
      name: 'Domain Isolation',
      description: 'Domain cannot import from adapters',
      severity: 'error',
      from: { pattern: 'src/domain/**', mode: 'file' },
      to: { pattern: 'src/adapters/**', mode: 'file' },
      allowed: false
    }

    const result = validateRule(rule)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_REQUIRED_FIELD',
        path: 'id'
      })
    )
  })

  test('fails when severity is invalid', () => {
    const rule = {
      id: 'domain-isolation',
      name: 'Domain Isolation',
      description: 'Domain cannot import from adapters',
      severity: 'critical',
      from: { pattern: 'src/domain/**', mode: 'file' },
      to: { pattern: 'src/adapters/**', mode: 'file' },
      allowed: false
    }

    const result = validateRule(rule)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_SEVERITY'
      })
    )
  })

  test('fails when from boundary is invalid', () => {
    const rule = {
      id: 'domain-isolation',
      name: 'Domain Isolation',
      description: 'Domain cannot import from adapters',
      severity: 'error',
      from: { mode: 'file' }, // Missing pattern or tag
      to: { pattern: 'src/adapters/**', mode: 'file' },
      allowed: false
    }

    const result = validateRule(rule)

    expect(result.valid).toBe(false)
  })
})

describe('validateConfig', () => {
  test('validates correct config', () => {
    const config: StrictureConfig = {
      preset: '@stricture/hexagonal',
      boundaries: [
        {
          name: 'domain',
          pattern: 'src/domain/**',
          mode: 'file'
        }
      ],
      rules: [
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain cannot import adapters',
          severity: 'error',
          from: { pattern: 'src/domain/**', mode: 'file' },
          to: { pattern: 'src/adapters/**', mode: 'file' },
          allowed: false
        }
      ]
    }

    const result = validateConfig(config)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('fails when preset is missing', () => {
    const config = {
      boundaries: [],
      rules: []
    }

    const result = validateConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_REQUIRED_FIELD',
        path: 'preset'
      })
    )
  })

  test('fails when boundaries is not an array', () => {
    const config = {
      preset: '@stricture/hexagonal',
      boundaries: 'not-an-array',
      rules: []
    }

    const result = validateConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_TYPE'
      })
    )
  })

  test('validates nested boundary errors', () => {
    const config = {
      preset: '@stricture/hexagonal',
      boundaries: [
        {
          pattern: 'src/domain/**', // Missing name
          mode: 'file'
        }
      ],
      rules: []
    }

    const result = validateConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: 'boundaries[0].name'
      })
    )
  })
})

describe('validateImport', () => {
  const boundaries: BoundaryDefinition[] = [
    {
      name: 'domain',
      pattern: 'src/domain/**/*.ts',
      mode: 'file',
      tags: ['domain']
    },
    {
      name: 'adapters',
      pattern: 'src/adapters/**/*.ts',
      mode: 'file',
      tags: ['adapter']
    },
    {
      name: 'ports',
      pattern: 'src/ports/**/*.ts',
      mode: 'file',
      tags: ['port']
    }
  ]

  describe('basic validation', () => {
    test('allows imports when no rule blocks them', () => {
      const rules: ArchRule[] = []

      const result = validateImport(
        '/project/src/adapters/http.ts',
        '/project/src/domain/user.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
      expect(result.violatedRule).toBeUndefined()
    })

    test('blocks imports when rule forbids them', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain cannot import from adapters',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'adapter', mode: 'file' },
          allowed: false
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        '/project/src/adapters/http.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
      expect(result.violatedRule?.id).toBe('domain-isolation')
      expect(result.message).toBeTruthy()
    })

    test('allows imports when rule permits them', () => {
      const rules: ArchRule[] = [
        {
          id: 'adapters-can-use-domain',
          name: 'Adapters can use domain',
          description: 'Adapters can import domain',
          severity: 'error',
          from: { tag: 'adapter', mode: 'file' },
          to: { tag: 'domain', mode: 'file' },
          allowed: true
        }
      ]

      const result = validateImport(
        '/project/src/adapters/http.ts',
        '/project/src/domain/user.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })
  })

  describe('external dependencies', () => {
    test('allows external dependencies by default (no rule)', () => {
      const rules: ArchRule[] = []

      const result = validateImport(
        '/project/src/domain/user.ts',
        'node_modules/zod/index.js',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })

    test('blocks external dependencies when rule forbids them', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-pure',
          name: 'Domain Purity',
          description: 'Domain cannot import external libraries',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'external', mode: 'file' },
          allowed: false
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        'node_modules/zod/index.js',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
      expect(result.violatedRule?.id).toBe('domain-pure')
    })

    test('allows specific external dependencies with pattern', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-no-externals',
          name: 'Domain No Externals',
          description: 'Domain cannot import externals',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'external', mode: 'file' },
          allowed: false
        },
        {
          id: 'domain-allow-types',
          name: 'Domain Allow Types',
          description: 'Domain can import @types',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { pattern: 'node_modules/@types/**', mode: 'file' },
          allowed: true
        }
      ]

      // Should block non-types external
      const blocked = validateImport(
        '/project/src/domain/user.ts',
        'node_modules/zod/index.js',
        rules,
        boundaries
      )

      expect(blocked.valid).toBe(false)

      // Should allow @types external
      const allowed = validateImport(
        '/project/src/domain/user.ts',
        'node_modules/@types/node/index.d.ts',
        rules,
        boundaries
      )

      expect(allowed.valid).toBe(true)
    })
  })

  describe('wildcard patterns', () => {
    test('wildcard tag matches any boundary', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-isolated',
          name: 'Domain Fully Isolated',
          description: 'Domain cannot import anything except itself',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: '*', mode: 'file' },
          allowed: false
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        '/project/src/adapters/http.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
    })

    test('wildcard pattern matches any file', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-isolated',
          name: 'Domain Fully Isolated',
          description: 'Domain cannot import anything',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { pattern: '**', mode: 'file' },
          allowed: false
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        '/project/src/adapters/http.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
    })
  })

  describe('error messages', () => {
    test('includes custom error message when provided', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain cannot import adapters',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'adapter', mode: 'file' },
          allowed: false,
          message: 'Custom error: Domain must not depend on adapters'
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        '/project/src/adapters/http.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
      expect(result.message).toBe('Custom error: Domain must not depend on adapters')
    })

    test('generates default message when custom message not provided', () => {
      const rules: ArchRule[] = [
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain cannot import adapters',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'adapter', mode: 'file' },
          allowed: false
        }
      ]

      const result = validateImport(
        '/project/src/domain/user.ts',
        '/project/src/adapters/http.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(false)
      expect(result.message).toContain('domain')
      expect(result.message).toContain('adapters')
    })
  })

  describe('rule specificity and precedence', () => {
    test('specific rule takes precedence over general wildcard', () => {
      const boundaries: BoundaryDefinition[] = [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file', tags: ['domain'] }
      ]

      const rules: ArchRule[] = [
        // General rule first
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain isolated from everything',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: '*', mode: 'file' },        // Wildcard - generic
          allowed: false
        },
        // Specific rule second
        {
          id: 'domain-self',
          name: 'Domain Self Imports',
          description: 'Domain can import itself',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'domain', mode: 'file' },   // Specific
          allowed: true
        }
      ]

      // domain → domain should be allowed (specific rule wins)
      const result = validateImport(
        'src/domain/user.ts',
        'src/domain/order.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })

    test('specific rule takes precedence regardless of array order', () => {
      const boundaries: BoundaryDefinition[] = [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file', tags: ['domain'] }
      ]

      // Test with rules in reverse order
      const rules: ArchRule[] = [
        // Specific rule first this time
        {
          id: 'domain-self',
          name: 'Domain Self Imports',
          description: 'Domain can import itself',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'domain', mode: 'file' },   // Specific
          allowed: true
        },
        // General rule second
        {
          id: 'domain-isolation',
          name: 'Domain Isolation',
          description: 'Domain isolated from everything',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: '*', mode: 'file' },        // Wildcard - generic
          allowed: false
        }
      ]

      // domain → domain should still be allowed
      const result = validateImport(
        'src/domain/user.ts',
        'src/domain/order.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })

    test('pattern-based rule more specific than tag-based', () => {
      const boundaries: BoundaryDefinition[] = [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file', tags: ['domain'] }
      ]

      const rules: ArchRule[] = [
        {
          id: 'tag-based',
          name: 'Tag Based Rule',
          description: 'Domain cannot import external',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'external', mode: 'file' },
          allowed: false
        },
        {
          id: 'pattern-based',
          name: 'Pattern Based Rule',
          description: 'Domain can import types',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { pattern: 'node_modules/@types/**', mode: 'file' },  // More specific
          allowed: true
        }
      ]

      const result = validateImport(
        'src/domain/user.ts',
        'node_modules/@types/node/index.d.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })

    test('more specific patterns have higher precedence', () => {
      const boundaries: BoundaryDefinition[] = [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file', tags: ['domain'] }
      ]

      const rules: ArchRule[] = [
        {
          id: 'generic-pattern',
          name: 'Generic Pattern',
          description: 'Block all external',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { pattern: '**', mode: 'file' },  // Very generic
          allowed: false
        },
        {
          id: 'specific-pattern',
          name: 'Specific Pattern',
          description: 'Allow specific path',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { pattern: 'src/domain/**', mode: 'file' },  // More specific
          allowed: true
        }
      ]

      const result = validateImport(
        'src/domain/user.ts',
        'src/domain/order.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })

    test('wildcard is least specific and evaluated last', () => {
      const boundaries: BoundaryDefinition[] = [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file', tags: ['domain'] },
        { name: 'ports', pattern: 'src/ports/**', mode: 'file', tags: ['ports'] }
      ]

      const rules: ArchRule[] = [
        // Wildcard rule - should be evaluated last
        {
          id: 'wildcard-deny',
          name: 'Wildcard Deny',
          description: 'Deny everything by default',
          severity: 'error',
          from: { tag: '*', mode: 'file' },
          to: { tag: '*', mode: 'file' },
          allowed: false
        },
        // Specific rule - should be evaluated first
        {
          id: 'domain-ports-allow',
          name: 'Domain Can Use Ports',
          description: 'Domain can import ports',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'ports', mode: 'file' },
          allowed: true
        }
      ]

      const result = validateImport(
        'src/domain/user.ts',
        'src/ports/user-port.ts',
        rules,
        boundaries
      )

      expect(result.valid).toBe(true)
    })
  })
})
