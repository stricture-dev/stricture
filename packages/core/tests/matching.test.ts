import { describe, test, expect } from 'vitest'
import { matchesPattern } from '../src/matching/match-pattern.js'
import type { BoundaryPattern, BoundaryDefinition } from '../src/types/boundary.js'

describe('matchesPattern', () => {
  describe('file mode patterns', () => {
    test('matches files with glob pattern', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/domain/**/*.ts',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/domain/models/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/adapters/user.ts', pattern)).toBe(false)
    })

    test('respects exclude patterns', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/domain/**/*.ts',
        mode: 'file',
        exclude: ['**/*.test.ts']
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/domain/user.test.ts', pattern)).toBe(false)
    })

    test('handles multiple exclusions', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/**/*.ts',
        mode: 'file',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/domain/user.test.ts', pattern)).toBe(false)
      expect(matchesPattern('src/domain/user.spec.ts', pattern)).toBe(false)
    })
  })

  describe('folder mode patterns', () => {
    test('matches files by parent folder', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/domain',
        mode: 'folder'
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/domain/models/user.ts', pattern)).toBe(false)
      expect(matchesPattern('src/adapters/user.ts', pattern)).toBe(false)
    })

    test('matches files with glob in folder mode', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/domain/**',
        mode: 'folder'
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('src/domain/models/user.ts', pattern)).toBe(true)
    })
  })

  describe('tag resolution', () => {
    const boundaries: BoundaryDefinition[] = [
      {
        name: 'domain',
        pattern: 'src/domain/**/*.ts',
        mode: 'file'
      },
      {
        name: 'adapters',
        pattern: 'src/adapters/**/*.ts',
        mode: 'file',
        tags: ['adapter', 'infrastructure']
      }
    ]

    test('resolves tag to boundary pattern', () => {
      const pattern: BoundaryPattern = {
        tag: 'domain',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.ts', pattern, boundaries)).toBe(true)
      expect(matchesPattern('src/adapters/user.ts', pattern, boundaries)).toBe(false)
    })

    test('matches boundary with tag in tags array', () => {
      const pattern: BoundaryPattern = {
        tag: 'adapter',
        mode: 'file'
      }

      expect(matchesPattern('src/adapters/db.ts', pattern, boundaries)).toBe(true)
      expect(matchesPattern('src/domain/user.ts', pattern, boundaries)).toBe(false)
    })

    test('returns false for unknown tag', () => {
      const pattern: BoundaryPattern = {
        tag: 'unknown',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.ts', pattern, boundaries)).toBe(false)
    })
  })

  describe('special patterns', () => {
    test('handles wildcard pattern', () => {
      const pattern: BoundaryPattern = {
        pattern: '**',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(true)
      expect(matchesPattern('anywhere/else.ts', pattern)).toBe(true)
    })

    test('handles specific file extensions', () => {
      const pattern: BoundaryPattern = {
        pattern: '**/*.{ts,tsx}',
        mode: 'file'
      }

      expect(matchesPattern('src/component.tsx', pattern)).toBe(true)
      expect(matchesPattern('src/utils.ts', pattern)).toBe(true)
      expect(matchesPattern('src/script.js', pattern)).toBe(false)
    })
  })

  describe('edge cases', () => {
    test('handles empty pattern', () => {
      const pattern: BoundaryPattern = {
        pattern: '',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.ts', pattern)).toBe(false)
    })

    test('handles paths with dots', () => {
      const pattern: BoundaryPattern = {
        pattern: 'src/**/*.ts',
        mode: 'file'
      }

      expect(matchesPattern('src/domain/user.service.ts', pattern)).toBe(true)
      expect(matchesPattern('src/.config/setup.ts', pattern)).toBe(true)
    })

    test('handles absolute paths', () => {
      const pattern: BoundaryPattern = {
        pattern: '**/domain/**',
        mode: 'file'
      }

      expect(matchesPattern('/project/src/domain/user.ts', pattern)).toBe(true)
    })
  })
})
