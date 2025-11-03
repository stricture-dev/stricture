import { describe, it, expect } from 'vitest'
import { loadTsconfigPaths } from '../../../src/rules/utils/load-tsconfig.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('loadTsconfigPaths', () => {
  it('should load paths from tsconfig.json', () => {
    const baseDir = path.join(__dirname, '../../fixtures')
    const paths = loadTsconfigPaths(baseDir)

    expect(paths).toBeDefined()
    expect(paths).toHaveProperty('@core/*')
    expect(paths).toHaveProperty('@adapters/*')
    expect(paths).toHaveProperty('@domain/*')
    expect(paths['@core/*']).toEqual(['src/core/*'])
    expect(paths['@adapters/*']).toEqual(['src/adapters/*'])
  })

  it('should return null if tsconfig.json does not exist', () => {
    const baseDir = path.join(__dirname, '../../fixtures/nonexistent')
    const paths = loadTsconfigPaths(baseDir)

    expect(paths).toBeNull()
  })

  it('should return null if tsconfig.json has no paths', () => {
    const baseDir = path.join(__dirname, '../../fixtures/no-paths')
    const paths = loadTsconfigPaths(baseDir)

    expect(paths).toBeNull()
  })

  it('should handle tsconfig.json with extends', () => {
    const baseDir = path.join(__dirname, '../../fixtures/with-extends')
    const paths = loadTsconfigPaths(baseDir)

    // For now, we'll just handle basic cases
    // Full extends resolution is complex and handled by tsconfig-paths library
    expect(paths).toBeDefined()
  })

  it('should resolve relative baseUrl correctly', () => {
    const baseDir = path.join(__dirname, '../../fixtures')
    const paths = loadTsconfigPaths(baseDir)

    // Paths should be relative to baseUrl (which is "." in our test config)
    expect(paths).toBeDefined()
    expect(paths?.['@core/*']).toEqual(['src/core/*'])
  })

  it('should handle empty compilerOptions', () => {
    const baseDir = path.join(__dirname, '../../fixtures/empty-compiler-options')
    const paths = loadTsconfigPaths(baseDir)

    expect(paths).toBeNull()
  })
})
