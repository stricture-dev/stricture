import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { validate } from '../../src/commands/validate/index.js'
import { ensureDir } from '../../src/utils/file-utils.js'

const TEST_DIR = path.join(process.cwd(), '.test-tmp-validate')

describe('validate command', () => {
  beforeEach(async () => {
    await ensureDir(TEST_DIR)
  })

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true })
  })

  it('should fail when config not found', async () => {
    const configPath = path.join(TEST_DIR, '.stricture/config.json')
    const result = await validate({ configPath })
    expect(result).toBe(false)
  })

  it('should validate correct config', async () => {
    // Create .stricture directory and config
    await ensureDir(path.join(TEST_DIR, '.stricture'))

    const config = {
      version: '1',
      preset: '@stricture/hexagonal',
      boundaries: [
        {
          name: 'domain',
          pattern: 'src/domain/**',
          mode: 'file' as const,
          tags: ['domain'],
          description: 'Domain layer'
        }
      ],
      rules: [
        {
          id: 'test-rule',
          name: 'Test Rule',
          description: 'Test rule description',
          from: { tag: 'domain', mode: 'file' as const },
          to: { tag: 'domain', mode: 'file' as const },
          allowed: true,
          severity: 'error' as const
        }
      ]
    }

    const configPath = path.join(TEST_DIR, '.stricture/config.json')
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))

    const result = await validate({ configPath })
    expect(result).toBe(true)
  })

  it('should fail for invalid JSON', async () => {
    await ensureDir(path.join(TEST_DIR, '.stricture'))

    const configPath = path.join(TEST_DIR, '.stricture/config.json')
    await fs.writeFile(configPath, 'invalid json {')

    const result = await validate({ configPath })
    expect(result).toBe(false)
  })

  describe('structure validation', () => {
    it('should pass when all expected directories exist', async () => {
      // Create .stricture directory and config
      await ensureDir(path.join(TEST_DIR, '.stricture'))

      const config = {
        version: '1',
        preset: '@stricture/hexagonal',
        boundaries: [
          {
            name: 'domain',
            pattern: 'src/domain/**',
            mode: 'file' as const,
            tags: ['domain']
          },
          {
            name: 'ports',
            pattern: 'src/ports/**',
            mode: 'file' as const,
            tags: ['ports']
          }
        ],
        rules: []
      }

      const configPath = path.join(TEST_DIR, '.stricture/config.json')
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))

      // Create expected directories
      await ensureDir(path.join(TEST_DIR, 'src/domain'))
      await ensureDir(path.join(TEST_DIR, 'src/ports'))

      const result = await validate({
        configPath,
        structure: true,
        projectRoot: TEST_DIR
      })
      expect(result).toBe(true)
    })

    it('should fail when some directories are missing', async () => {
      // Create .stricture directory and config
      await ensureDir(path.join(TEST_DIR, '.stricture'))

      const config = {
        version: '1',
        preset: '@stricture/hexagonal',
        boundaries: [
          {
            name: 'domain',
            pattern: 'src/domain/**',
            mode: 'file' as const,
            tags: ['domain']
          },
          {
            name: 'ports',
            pattern: 'src/ports/**',
            mode: 'file' as const,
            tags: ['ports']
          }
        ],
        rules: []
      }

      const configPath = path.join(TEST_DIR, '.stricture/config.json')
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))

      // Only create one directory
      await ensureDir(path.join(TEST_DIR, 'src/domain'))

      const result = await validate({
        configPath,
        structure: true,
        projectRoot: TEST_DIR
      })
      expect(result).toBe(false)
    })

    it('should fail when no expected directories exist', async () => {
      // Create .stricture directory and config
      await ensureDir(path.join(TEST_DIR, '.stricture'))

      const config = {
        version: '1',
        preset: '@stricture/hexagonal',
        boundaries: [
          {
            name: 'domain',
            pattern: 'src/domain/**',
            mode: 'file' as const,
            tags: ['domain']
          }
        ],
        rules: []
      }

      const configPath = path.join(TEST_DIR, '.stricture/config.json')
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))

      // Don't create any directories

      const result = await validate({
        configPath,
        structure: true,
        projectRoot: TEST_DIR
      })
      expect(result).toBe(false)
    })

    it('should handle complex patterns correctly', async () => {
      // Create .stricture directory and config
      await ensureDir(path.join(TEST_DIR, '.stricture'))

      const config = {
        version: '1',
        preset: '@stricture/hexagonal',
        boundaries: [
          {
            name: 'domain',
            pattern: 'src/core/domain/**/*.ts',
            mode: 'file' as const,
            tags: ['domain']
          },
          {
            name: 'adapters',
            pattern: 'src/adapters/driving/**',
            mode: 'file' as const,
            tags: ['adapters']
          }
        ],
        rules: []
      }

      const configPath = path.join(TEST_DIR, '.stricture/config.json')
      await fs.writeFile(configPath, JSON.stringify(config, null, 2))

      // Create expected directories
      await ensureDir(path.join(TEST_DIR, 'src/core/domain'))
      await ensureDir(path.join(TEST_DIR, 'src/adapters/driving'))

      const result = await validate({
        configPath,
        structure: true,
        projectRoot: TEST_DIR
      })
      expect(result).toBe(true)
    })
  })
})
