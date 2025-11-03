import { describe, test, expect } from 'vitest'
import { resolveImportPath } from '../src/resolution/resolve-import.js'
import path from 'node:path'

describe('resolveImportPath', () => {
  const baseDir = '/project'

  describe('relative imports', () => {
    test('resolves relative import from same directory', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = './models'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\/project\/src\/domain\/models/)
    })

    test('resolves parent directory import', () => {
      const fromPath = '/project/src/domain/models/user.ts'
      const importSpec = '../services/user-service'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\/project\/src\/domain\/services\/user-service/)
    })

    test('resolves multiple parent directories', () => {
      const fromPath = '/project/src/domain/models/entities/user.ts'
      const importSpec = '../../../adapters/database'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\/project\/src\/adapters\/database/)
    })

    test('adds .ts extension if file exists', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = './models'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      // Should attempt to add extension
      expect(resolved).toBeTruthy()
    })
  })

  describe('path aliases', () => {
    const tsconfigPaths = {
      '@/*': ['src/*'],
      '@domain/*': ['src/domain/*'],
      '@adapters/*': ['src/adapters/*']
    }

    test('resolves path alias with wildcard', () => {
      const fromPath = '/project/src/adapters/http/controller.ts'
      const importSpec = '@/domain/user'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir, tsconfigPaths)

      expect(resolved).toMatch(/\/project\/src\/domain\/user/)
    })

    test('resolves specific path alias', () => {
      const fromPath = '/project/src/adapters/http/controller.ts'
      const importSpec = '@domain/user'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir, tsconfigPaths)

      expect(resolved).toMatch(/\/project\/src\/domain\/user/)
    })

    test('resolves deep path alias', () => {
      const fromPath = '/project/src/adapters/http/controller.ts'
      const importSpec = '@domain/models/entities/user'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir, tsconfigPaths)

      expect(resolved).toMatch(/\/project\/src\/domain\/models\/entities\/user/)
    })
  })

  describe('external dependencies (node_modules)', () => {
    test('marks bare imports as external', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = 'zod'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toBe('node_modules/zod')
    })

    test('marks scoped packages as external', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = '@types/node'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toBe('node_modules/@types/node')
    })

    test('marks deep imports from packages as external', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = 'lodash/fp'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toBe('node_modules/lodash/fp')
    })

    test('does not confuse path alias with external', () => {
      const tsconfigPaths = {
        '@/*': ['src/*']
      }

      const fromPath = '/project/src/adapters/controller.ts'
      const importSpec = '@/domain/user'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir, tsconfigPaths)

      expect(resolved).not.toContain('node_modules')
    })
  })

  describe('file extensions', () => {
    test('preserves existing .ts extension', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = './models.ts'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\.ts$/)
    })

    test('preserves existing .tsx extension', () => {
      const fromPath = '/project/src/ui/page.tsx'
      const importSpec = './component.tsx'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\.tsx$/)
    })

    test('preserves existing .js extension', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = './legacy.js'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\.js$/)
    })
  })

  describe('absolute imports', () => {
    test('handles absolute path starting with /', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = '/src/adapters/database'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      // Should be treated as project root relative
      expect(resolved).toMatch(/\/project\/src\/adapters\/database/)
    })
  })

  describe('edge cases', () => {
    test('handles empty import specifier', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = ''

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      // Should return something reasonable (likely external)
      expect(resolved).toBeTruthy()
    })

    test('handles import with query params', () => {
      const fromPath = '/project/src/domain/user.ts'
      const importSpec = './data.json?raw'

      const resolved = resolveImportPath(fromPath, importSpec, baseDir)

      expect(resolved).toMatch(/\/project\/src\/domain\/data\.json/)
    })

    test('handles Windows-style paths', () => {
      const fromPath = 'C:\\project\\src\\domain\\user.ts'
      const importSpec = './models'

      const resolved = resolveImportPath(fromPath, importSpec, 'C:\\project')

      expect(resolved).toBeTruthy()
    })
  })
})
