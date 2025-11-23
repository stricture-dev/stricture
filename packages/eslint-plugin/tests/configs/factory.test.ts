import { describe, it, expect } from 'vitest'
import plugin from '../../src/index.js'

describe('Config Factories', () => {
  describe('config structure', () => {
    it('should be a function', () => {
      expect(typeof plugin.configs.recommended).toBe('function')
    })

    it('should return ESLint config object when called', () => {
      const config = plugin.configs.recommended()
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(config.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      const config = plugin.configs.recommended()
      const ruleConfig = config.rules['@stricture/enforce-boundaries']
      expect(Array.isArray(ruleConfig)).toBe(true)
      expect(ruleConfig[0]).toBe('error')
    })
  })

  describe('recommended config', () => {
    it('should not load a preset by default', () => {
      const config = plugin.configs.recommended()
      const ruleConfig = config.rules['@stricture/enforce-boundaries']

      // recommended doesn't auto-load a preset, so inlineConfig should be undefined
      expect(ruleConfig[1].inlineConfig).toBeUndefined()
    })

    it('should accept custom config', () => {
      const customConfig = {
        boundaries: [{ name: 'test', pattern: 'test/**', mode: 'file' as const, tags: [] }],
        rules: []
      }
      const config = plugin.configs.recommended(customConfig)
      const inlineConfig = config.rules['@stricture/enforce-boundaries'][1].inlineConfig

      expect(inlineConfig).toEqual(customConfig)
    })

    it('should accept partial config with overrides', () => {
      const partialConfig = {
        ignorePatterns: ['**/*.test.ts']
      }
      const config = plugin.configs.recommended(partialConfig)
      const inlineConfig = config.rules['@stricture/enforce-boundaries'][1].inlineConfig

      expect(inlineConfig).toEqual(partialConfig)
    })
  })

  // Test that preset config factories exist (but don't call them to avoid loading actual presets in tests)
  const presetConfigs = ['hexagonal', 'layered', 'clean', 'modular', 'nextjs', 'nestjs'] as const

  presetConfigs.forEach(preset => {
    describe(`${preset} config`, () => {
      it('should be a function', () => {
        expect(typeof plugin.configs[preset]).toBe('function')
      })

      // Note: We don't test calling the preset configs because they require loading
      // the actual preset packages (@stricture/hexagonal, etc.) which may not be
      // available in the test environment. Those are integration tested in real projects.
    })
  })
})
