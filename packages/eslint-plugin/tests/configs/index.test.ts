import { describe, it, expect } from 'vitest'
import plugin from '../../src/index.js'

describe('ESLint Plugin Configs', () => {
  it('should export configs object', () => {
    expect(plugin.configs).toBeDefined()
    expect(typeof plugin.configs).toBe('object')
  })

  describe('recommended config', () => {
    it('should be a function', () => {
      expect(typeof plugin.configs.recommended).toBe('function')
    })

    it('should return ESLint config object when called', () => {
      const config = plugin.configs.recommended()
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })

    it('should include @stricture plugin', () => {
      const config = plugin.configs.recommended()
      expect(config.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      const config = plugin.configs.recommended()
      expect(config.rules['@stricture/enforce-boundaries'][0]).toBe('error')
    })
  })

  // Test that preset configs are functions (but don't call them to avoid loading actual presets)
  const presetConfigs = ['hexagonal', 'layered', 'clean', 'modular', 'nextjs', 'nestjs']

  presetConfigs.forEach(presetName => {
    describe(`${presetName} config`, () => {
      it('should be a function', () => {
        expect(typeof plugin.configs[presetName]).toBe('function')
      })
    })
  })

  describe('all configs', () => {
    it('should export all preset configs', () => {
      const expectedConfigs = [
        'recommended',
        'hexagonal',
        'layered',
        'clean',
        'modular',
        'nextjs',
        'nestjs'
      ]

      for (const configName of expectedConfigs) {
        expect(plugin.configs[configName]).toBeDefined()
        expect(typeof plugin.configs[configName]).toBe('function')
      }
    })
  })
})
