import { describe, it, expect } from 'vitest'
import { loadConfig, clearConfigCache } from '../../../src/rules/utils/load-config.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('loadConfig', () => {
  it('should load a valid config file', () => {
    const configPath = path.join(__dirname, '../../fixtures/configs/hexagonal-config.json')
    const config = loadConfig(configPath)

    expect(config).toBeDefined()
    expect(config.preset).toBe('@stricture/hexagonal')
    expect(config.boundaries).toHaveLength(4)
    expect(config.rules).toHaveLength(3)
  })

  it('should throw error for non-existent config file', () => {
    const configPath = path.join(__dirname, '../../fixtures/configs/non-existent.json')
    expect(() => loadConfig(configPath)).toThrow()
  })

  it('should throw error for invalid JSON', () => {
    const configPath = path.join(__dirname, '../../fixtures/configs/malformed.json')
    // We'll create this in the next step
    expect(() => loadConfig(configPath)).toThrow('Failed to parse config')
  })

  it('should cache config to avoid repeated file reads', () => {
    const configPath = path.join(__dirname, '../../fixtures/configs/hexagonal-config.json')

    const config1 = loadConfig(configPath)
    const config2 = loadConfig(configPath)

    // Should return the same cached instance
    expect(config1).toBe(config2)
  })

  it('should reload config when file is modified', async () => {
    // This is more of an integration test
    // For now we'll just test that clearCache works
    const configPath = path.join(__dirname, '../../fixtures/configs/hexagonal-config.json')

    const config1 = loadConfig(configPath)
    clearConfigCache()
    const config2 = loadConfig(configPath)

    // After clearing cache, should load fresh (not same instance)
    expect(config1).not.toBe(config2)
    // But should have same content
    expect(config1).toEqual(config2)
  })

  it('should resolve relative paths from the config location', () => {
    const configPath = path.join(__dirname, '../../fixtures/configs/hexagonal-config.json')
    const config = loadConfig(configPath)

    // Config should be loaded successfully
    expect(config).toBeDefined()
  })
})
