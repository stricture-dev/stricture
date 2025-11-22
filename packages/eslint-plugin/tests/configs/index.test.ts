import { describe, it, expect } from 'vitest'
import plugin from '../../src/index.js'

describe('ESLint Plugin Configs', () => {
  it('should export configs object', () => {
    expect(plugin.configs).toBeDefined()
    expect(typeof plugin.configs).toBe('object')
  })

  describe('recommended config', () => {
    it('should have recommended config', () => {
      expect(plugin.configs.recommended).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.recommended.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.recommended.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.recommended
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('hexagonal config', () => {
    it('should have hexagonal config', () => {
      expect(plugin.configs.hexagonal).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.hexagonal.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.hexagonal.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.hexagonal
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('layered config', () => {
    it('should have layered config', () => {
      expect(plugin.configs.layered).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.layered.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.layered.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.layered
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('clean config', () => {
    it('should have clean config', () => {
      expect(plugin.configs.clean).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.clean.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.clean.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.clean
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('modular config', () => {
    it('should have modular config', () => {
      expect(plugin.configs.modular).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.modular.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.modular.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.modular
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('nextjs config', () => {
    it('should have nextjs config', () => {
      expect(plugin.configs.nextjs).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.nextjs.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.nextjs.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.nextjs
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
    })
  })

  describe('nestjs config', () => {
    it('should have nestjs config', () => {
      expect(plugin.configs.nestjs).toBeDefined()
    })

    it('should include @stricture plugin', () => {
      expect(plugin.configs.nestjs.plugins).toEqual(['@stricture'])
    })

    it('should enable enforce-boundaries rule as error', () => {
      expect(plugin.configs.nestjs.rules).toEqual({
        '@stricture/enforce-boundaries': 'error'
      })
    })

    it('should be a valid ESLint config object', () => {
      const config = plugin.configs.nestjs
      expect(config).toHaveProperty('plugins')
      expect(config).toHaveProperty('rules')
      expect(Array.isArray(config.plugins)).toBe(true)
      expect(typeof config.rules).toBe('object')
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
      }
    })

    it('should have consistent structure across all configs', () => {
      const configNames = [
        'recommended',
        'hexagonal',
        'layered',
        'clean',
        'modular',
        'nextjs',
        'nestjs'
      ]

      for (const configName of configNames) {
        const config = plugin.configs[configName]
        expect(config.plugins).toEqual(['@stricture'])
        expect(config.rules).toEqual({
          '@stricture/enforce-boundaries': 'error'
        })
      }
    })

    it('should not include plugin instance in configs (for serialization)', () => {
      const configNames = [
        'recommended',
        'hexagonal',
        'layered',
        'clean',
        'modular',
        'nextjs',
        'nestjs'
      ]

      for (const configName of configNames) {
        const config = plugin.configs[configName]
        // Should only have plugins as array of strings, not plugin instances
        expect(Array.isArray(config.plugins)).toBe(true)
        expect(typeof config.plugins[0]).toBe('string')
      }
    })
  })
})
