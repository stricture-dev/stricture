import { describe, test, expect } from 'vitest'
import { mergeBoundaries, mergeRules, resolveConfig } from '../src/index.js'
import type { BoundaryDefinition, ArchRule, StrictureConfig, ArchPreset } from '../src/index.js'

describe('mergeBoundaries', () => {
  test('concatenates boundaries when names differ', () => {
    const base: BoundaryDefinition[] = [
      {
        name: 'domain',
        pattern: 'src/domain/**',
        mode: 'file'
      }
    ]

    const override: BoundaryDefinition[] = [
      {
        name: 'adapters',
        pattern: 'src/adapters/**',
        mode: 'file'
      }
    ]

    const result = mergeBoundaries(base, override)

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('domain')
    expect(result[1].name).toBe('adapters')
  })

  test('overrides boundary when names match', () => {
    const base: BoundaryDefinition[] = [
      {
        name: 'domain',
        pattern: 'src/domain/**',
        mode: 'file'
      }
    ]

    const override: BoundaryDefinition[] = [
      {
        name: 'domain',
        pattern: 'src/core/domain/**',
        mode: 'folder'
      }
    ]

    const result = mergeBoundaries(base, override)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('domain')
    expect(result[0].pattern).toBe('src/core/domain/**')
    expect(result[0].mode).toBe('folder')
  })

  test('preserves order: base first, then new overrides', () => {
    const base: BoundaryDefinition[] = [
      { name: 'domain', pattern: 'src/domain/**', mode: 'file' },
      { name: 'adapters', pattern: 'src/adapters/**', mode: 'file' }
    ]

    const override: BoundaryDefinition[] = [
      { name: 'ports', pattern: 'src/ports/**', mode: 'file' },
      { name: 'domain', pattern: 'src/core/domain/**', mode: 'file' }
    ]

    const result = mergeBoundaries(base, override)

    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('domain') // Overridden
    expect(result[0].pattern).toBe('src/core/domain/**')
    expect(result[1].name).toBe('adapters') // From base
    expect(result[2].name).toBe('ports') // New from override
  })
})

describe('mergeRules', () => {
  test('concatenates rules when IDs differ', () => {
    const base: ArchRule[] = [
      {
        id: 'rule-1',
        name: 'Rule 1',
        description: 'First rule',
        severity: 'error',
        from: { pattern: 'src/**', mode: 'file' },
        to: { pattern: 'lib/**', mode: 'file' },
        allowed: false
      }
    ]

    const override: ArchRule[] = [
      {
        id: 'rule-2',
        name: 'Rule 2',
        description: 'Second rule',
        severity: 'warn',
        from: { pattern: 'test/**', mode: 'file' },
        to: { pattern: 'src/**', mode: 'file' },
        allowed: true
      }
    ]

    const result = mergeRules(base, override)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('rule-1')
    expect(result[1].id).toBe('rule-2')
  })

  test('overrides rule when IDs match', () => {
    const base: ArchRule[] = [
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

    const override: ArchRule[] = [
      {
        id: 'domain-isolation',
        name: 'Domain Isolation (Updated)',
        description: 'Domain cannot import adapters or ports',
        severity: 'warn',
        from: { tag: 'domain', mode: 'file' },
        to: { tag: 'adapter', mode: 'file' },
        allowed: false
      }
    ]

    const result = mergeRules(base, override)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('domain-isolation')
    expect(result[0].name).toBe('Domain Isolation (Updated)')
    expect(result[0].severity).toBe('warn')
  })

  test('preserves rule order', () => {
    const base: ArchRule[] = [
      {
        id: 'rule-1',
        name: 'Rule 1',
        description: 'First',
        severity: 'error',
        from: { pattern: 'a/**', mode: 'file' },
        to: { pattern: 'b/**', mode: 'file' },
        allowed: false
      },
      {
        id: 'rule-2',
        name: 'Rule 2',
        description: 'Second',
        severity: 'error',
        from: { pattern: 'c/**', mode: 'file' },
        to: { pattern: 'd/**', mode: 'file' },
        allowed: false
      }
    ]

    const override: ArchRule[] = [
      {
        id: 'rule-3',
        name: 'Rule 3',
        description: 'Third',
        severity: 'error',
        from: { pattern: 'e/**', mode: 'file' },
        to: { pattern: 'f/**', mode: 'file' },
        allowed: false
      }
    ]

    const result = mergeRules(base, override)

    expect(result).toHaveLength(3)
    expect(result.map(r => r.id)).toEqual(['rule-1', 'rule-2', 'rule-3'])
  })
})

describe('resolveConfig', () => {
  test('merges base preset with config', () => {
    const basePreset: ArchPreset = {
      id: '@stricture/base',
      name: 'Base Architecture',
      description: 'Base preset',
      boundaries: [
        {
          name: 'domain',
          pattern: 'src/domain/**',
          mode: 'file'
        }
      ],
      rules: [
        {
          id: 'base-rule',
          name: 'Base Rule',
          description: 'Base rule',
          severity: 'error',
          from: { tag: 'domain', mode: 'file' },
          to: { tag: 'external', mode: 'file' },
          allowed: false
        }
      ]
    }

    const config: StrictureConfig = {
      preset: '@stricture/base',
      boundaries: [
        {
          name: 'adapters',
          pattern: 'src/adapters/**',
          mode: 'file'
        }
      ],
      rules: [
        {
          id: 'custom-rule',
          name: 'Custom Rule',
          description: 'Custom rule',
          severity: 'error',
          from: { tag: 'adapters', mode: 'file' },
          to: { tag: 'domain', mode: 'file' },
          allowed: true
        }
      ]
    }

    const presets = new Map<string, ArchPreset>([['@stricture/base', basePreset]])

    const result = resolveConfig(config, presets)

    expect(result.boundaries).toHaveLength(2)
    expect(result.rules).toHaveLength(2)
    expect(result.boundaries.some(b => b.name === 'domain')).toBe(true)
    expect(result.boundaries.some(b => b.name === 'adapters')).toBe(true)
    expect(result.rules.some(r => r.id === 'base-rule')).toBe(true)
    expect(result.rules.some(r => r.id === 'custom-rule')).toBe(true)
  })

  test('applies overrides to rules', () => {
    const basePreset: ArchPreset = {
      id: '@stricture/base',
      name: 'Base',
      description: 'Base',
      boundaries: [],
      rules: [
        {
          id: 'rule-1',
          name: 'Rule 1',
          description: 'Original',
          severity: 'error',
          from: { pattern: 'a/**', mode: 'file' },
          to: { pattern: 'b/**', mode: 'file' },
          allowed: false
        }
      ]
    }

    const config: StrictureConfig = {
      preset: '@stricture/base',
      boundaries: [],
      rules: [],
      overrides: [
        {
          id: 'rule-1',
          severity: 'warn'
        }
      ]
    }

    const presets = new Map<string, ArchPreset>([['@stricture/base', basePreset]])

    const result = resolveConfig(config, presets)

    expect(result.rules).toHaveLength(1)
    expect(result.rules[0].id).toBe('rule-1')
    expect(result.rules[0].severity).toBe('warn')
    expect(result.rules[0].name).toBe('Rule 1') // Preserved from base
  })

  test('extends multiple presets', () => {
    const basePreset: ArchPreset = {
      id: '@stricture/base',
      name: 'Base',
      description: 'Base',
      boundaries: [
        { name: 'domain', pattern: 'src/domain/**', mode: 'file' }
      ],
      rules: []
    }

    const extendPreset: ArchPreset = {
      id: '@stricture/extended',
      name: 'Extended',
      description: 'Extended',
      boundaries: [
        { name: 'adapters', pattern: 'src/adapters/**', mode: 'file' }
      ],
      rules: []
    }

    const config: StrictureConfig = {
      preset: '@stricture/base',
      extends: ['@stricture/extended'],
      boundaries: [],
      rules: []
    }

    const presets = new Map<string, ArchPreset>([
      ['@stricture/base', basePreset],
      ['@stricture/extended', extendPreset]
    ])

    const result = resolveConfig(config, presets)

    expect(result.boundaries).toHaveLength(2)
    expect(result.boundaries.some(b => b.name === 'domain')).toBe(true)
    expect(result.boundaries.some(b => b.name === 'adapters')).toBe(true)
  })
})
