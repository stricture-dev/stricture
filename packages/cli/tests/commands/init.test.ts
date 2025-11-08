import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { detectProject } from '../../src/commands/init/detect-project.js'
import { ensureDir } from '../../src/utils/file-utils.js'

const TEST_DIR = path.join(process.cwd(), '.test-tmp-init')

describe('init command', () => {
  beforeEach(async () => {
    await ensureDir(TEST_DIR)
  })

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true })
  })

  describe('detectProject', () => {
    it('should detect TypeScript project', async () => {
      // Create package.json
      const packageJson = {
        name: 'test-project',
        dependencies: { react: '^18.0.0' }
      }
      await fs.writeFile(
        path.join(TEST_DIR, 'package.json'),
        JSON.stringify(packageJson)
      )

      // Create tsconfig.json
      await fs.writeFile(
        path.join(TEST_DIR, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: {} })
      )

      // Create src directory
      await ensureDir(path.join(TEST_DIR, 'src'))

      const info = await detectProject(TEST_DIR)

      expect(info.hasTypeScript).toBe(true)
      expect(info.framework).toBe('react')
      expect(info.srcDirectory).toBe('src')
    })

    it('should detect Next.js project', async () => {
      const packageJson = {
        name: 'nextjs-project',
        dependencies: { next: '^14.0.0' }
      }
      await fs.writeFile(
        path.join(TEST_DIR, 'package.json'),
        JSON.stringify(packageJson)
      )

      const info = await detectProject(TEST_DIR)

      expect(info.framework).toBe('nextjs')
    })

    it('should detect package manager from lock file', async () => {
      const packageJson = { name: 'test' }
      await fs.writeFile(
        path.join(TEST_DIR, 'package.json'),
        JSON.stringify(packageJson)
      )

      // Create pnpm lock file
      await fs.writeFile(path.join(TEST_DIR, 'pnpm-lock.yaml'), '')

      const info = await detectProject(TEST_DIR)

      expect(info.packageManager).toBe('pnpm')
    })
  })
})
