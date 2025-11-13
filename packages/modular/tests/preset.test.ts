import { describe, it, expect } from 'vitest'
import { modularPreset, boundaries, rules, diagram, scaffolding } from '../src/index.js'

describe('@stricture/modular preset', () => {
  describe('preset structure', () => {
    it('should have all required fields', () => {
      expect(modularPreset.id).toBe('@stricture/modular')
      expect(modularPreset.name).toBe('Modular Architecture')
      expect(modularPreset.description).toBeTruthy()
      expect(modularPreset.boundaries).toBeDefined()
      expect(modularPreset.rules).toBeDefined()
      expect(modularPreset.diagram).toBeDefined()
      expect(modularPreset.scaffolding).toBeDefined()
    })

    it('should export preset as default', () => {
      expect(modularPreset).toBeDefined()
      expect(modularPreset.id).toBe('@stricture/modular')
    })
  })

  describe('boundaries', () => {
    it('should define 3 boundaries', () => {
      expect(boundaries).toHaveLength(3)
    })

    it('should define module-public boundary', () => {
      const modulePublic = boundaries.find(b => b.name === 'module-public')
      expect(modulePublic).toBeDefined()
      expect(modulePublic?.pattern).toBe('src/features/*/index.ts')
      expect(modulePublic?.mode).toBe('file')
      expect(modulePublic?.tags).toContain('module-public')
      expect(modulePublic?.tags).toContain('features')
      expect(modulePublic?.metadata?.visibility).toBe('public')
    })

    it('should define module-internal boundary', () => {
      const moduleInternal = boundaries.find(b => b.name === 'module-internal')
      expect(moduleInternal).toBeDefined()
      expect(moduleInternal?.pattern).toBe('src/features/**')
      expect(moduleInternal?.mode).toBe('file')
      expect(moduleInternal?.tags).toContain('module-internal')
      expect(moduleInternal?.tags).toContain('features')
      expect(moduleInternal?.metadata?.visibility).toBe('private')
    })

    it('should define shared boundary', () => {
      const shared = boundaries.find(b => b.name === 'shared')
      expect(shared).toBeDefined()
      expect(shared?.pattern).toBe('src/shared/**')
      expect(shared?.mode).toBe('file')
      expect(shared?.tags).toContain('shared')
      expect(shared?.tags).toContain('common')
      expect(shared?.metadata?.visibility).toBe('public')
    })

    it('should have unique boundary names', () => {
      const names = boundaries.map(b => b.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('should use file mode for all boundaries', () => {
      boundaries.forEach(boundary => {
        expect(boundary.mode).toBe('file')
      })
    })
  })

  describe('rules', () => {
    it('should define 11 rules', () => {
      expect(rules).toHaveLength(11)
    })

    it('should have unique rule IDs', () => {
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have unique rule names', () => {
      const names = rules.map(r => r.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('should have severity set for all rules', () => {
      rules.forEach(rule => {
        expect(rule.severity).toBeDefined()
        expect(rule.severity).toBe('error')
      })
    })

    describe('type definitions (highest specificity)', () => {
      it('should allow all boundaries to use @types', () => {
        const rule = rules.find(r => r.id === 'types-external-allowed')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('*')
        expect(rule?.to.pattern).toBe('node_modules/@types/**')
        expect(rule?.allowed).toBe(true)
        expect(rule?.severity).toBe('error')
      })
    })

    describe('module public API rules', () => {
      it('should allow public API to import from features boundary', () => {
        const rule = rules.find(r => r.id === 'module-public-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-public')
        expect(rule?.to.tag).toBe('features')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow public API to import shared utilities', () => {
        const rule = rules.find(r => r.id === 'module-public-to-shared')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-public')
        expect(rule?.to.tag).toBe('shared')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow public API to import external packages', () => {
        const rule = rules.find(r => r.id === 'module-public-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-public')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })
    })

    describe('module internal rules', () => {
      it('should allow internal files to import within features', () => {
        const rule = rules.find(r => r.id === 'module-internal-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-internal')
        expect(rule?.to.tag).toBe('features')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow internal files to import other module public APIs', () => {
        const rule = rules.find(r => r.id === 'module-internal-to-module-public')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-internal')
        expect(rule?.to.tag).toBe('module-public')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow internal files to import shared utilities', () => {
        const rule = rules.find(r => r.id === 'module-internal-to-shared')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-internal')
        expect(rule?.to.tag).toBe('shared')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow internal files to import external packages', () => {
        const rule = rules.find(r => r.id === 'module-internal-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('module-internal')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })
    })

    describe('shared utilities rules', () => {
      it('should allow shared to import itself', () => {
        const rule = rules.find(r => r.id === 'shared-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('shared')
        expect(rule?.to.tag).toBe('shared')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow shared to import external packages', () => {
        const rule = rules.find(r => r.id === 'shared-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('shared')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should deny shared from importing features', () => {
        const rule = rules.find(r => r.id === 'shared-not-features')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('shared')
        expect(rule?.to.tag).toBe('features')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.examples).toBeDefined()
        expect(rule?.examples?.bad).toBeDefined()
        expect(rule?.examples?.good).toBeDefined()
      })
    })

    describe('violation rules with examples', () => {
      it('should have bad examples for shared-not-features', () => {
        const rule = rules.find(r => r.id === 'shared-not-features')
        expect(rule?.examples?.bad).toBeDefined()
        expect(Array.isArray(rule?.examples?.bad)).toBe(true)
        expect((rule?.examples?.bad as string[]).length).toBeGreaterThan(0)
      })

      it('should have good examples for shared-not-features', () => {
        const rule = rules.find(r => r.id === 'shared-not-features')
        expect(rule?.examples?.good).toBeDefined()
        expect(Array.isArray(rule?.examples?.good)).toBe(true)
        expect((rule?.examples?.good as string[]).length).toBeGreaterThan(0)
      })

      it('should have helpful error messages for violations', () => {
        const rule = rules.find(r => r.id === 'shared-not-features')
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('feature')
        expect(rule?.message).toContain('shared')
      })
    })

    describe('rule coverage', () => {
      it('should cover module-public boundary (all rules)', () => {
        const fromPublic = rules.filter(r => r.from.tag === 'module-public')
        expect(fromPublic.length).toBeGreaterThan(0)
      })

      it('should cover module-internal boundary (all rules)', () => {
        const fromInternal = rules.filter(r => r.from.tag === 'module-internal')
        expect(fromInternal.length).toBeGreaterThan(0)
      })

      it('should cover shared boundary (all rules)', () => {
        const fromShared = rules.filter(r => r.from.tag === 'shared')
        expect(fromShared.length).toBeGreaterThan(0)
      })

      it('should have external dependencies allowed', () => {
        const externalRules = rules.filter(r => r.to.tag === 'external' && r.allowed === true)
        expect(externalRules.length).toBeGreaterThan(0)
      })
    })
  })

  describe('diagram', () => {
    it('should have mermaid diagram', () => {
      expect(diagram.type).toBe('mermaid')
      expect(diagram.content).toBeTruthy()
      expect(typeof diagram.content).toBe('string')
    })

    it('should define layers', () => {
      expect(diagram.layers).toBeDefined()
      expect(Array.isArray(diagram.layers)).toBe(true)
      expect(diagram.layers.length).toBeGreaterThan(0)
    })

    it('should include features layer', () => {
      const featuresLayer = diagram.layers.find(l => l.name === 'Features')
      expect(featuresLayer).toBeDefined()
      expect(featuresLayer?.boundaries).toContain('module-public')
      expect(featuresLayer?.boundaries).toContain('module-internal')
    })

    it('should include shared layer', () => {
      const sharedLayer = diagram.layers.find(l => l.name === 'Shared')
      expect(sharedLayer).toBeDefined()
      expect(sharedLayer?.boundaries).toContain('shared')
    })
  })

  describe('scaffolding', () => {
    it('should define directories', () => {
      expect(scaffolding.directories).toBeDefined()
      expect(Array.isArray(scaffolding.directories)).toBe(true)
      expect(scaffolding.directories.length).toBeGreaterThan(0)
    })

    it('should define files', () => {
      expect(scaffolding.files).toBeDefined()
      expect(Array.isArray(scaffolding.files)).toBe(true)
      expect(scaffolding.files.length).toBeGreaterThan(0)
    })

    it('should include features directory', () => {
      const featuresDir = scaffolding.directories.find(d => d.path === 'src/features')
      expect(featuresDir).toBeDefined()
      expect(featuresDir?.description).toBeTruthy()
    })

    it('should include shared directory', () => {
      const sharedDir = scaffolding.directories.find(d => d.path === 'src/shared')
      expect(sharedDir).toBeDefined()
      expect(sharedDir?.description).toBeTruthy()
    })

    it('should include auth module example', () => {
      const authDir = scaffolding.directories.find(d => d.path === 'src/features/auth')
      expect(authDir).toBeDefined()
    })

    it('should include dashboard module example', () => {
      const dashboardDir = scaffolding.directories.find(d => d.path === 'src/features/dashboard')
      expect(dashboardDir).toBeDefined()
    })

    it('should include profile module example', () => {
      const profileDir = scaffolding.directories.find(d => d.path === 'src/features/profile')
      expect(profileDir).toBeDefined()
    })

    it('should include public API files for modules', () => {
      const authIndex = scaffolding.files.find(f => f.path === 'src/features/auth/index.ts')
      expect(authIndex).toBeDefined()
      expect(authIndex?.content).toBeTruthy()

      const dashboardIndex = scaffolding.files.find(f => f.path === 'src/features/dashboard/index.ts')
      expect(dashboardIndex).toBeDefined()

      const profileIndex = scaffolding.files.find(f => f.path === 'src/features/profile/index.ts')
      expect(profileIndex).toBeDefined()
    })

    it('should include README files', () => {
      const featuresReadme = scaffolding.files.find(f => f.path === 'src/features/README.md')
      expect(featuresReadme).toBeDefined()
      expect(featuresReadme?.content).toBeTruthy()

      const sharedReadme = scaffolding.files.find(f => f.path === 'src/shared/README.md')
      expect(sharedReadme).toBeDefined()
      expect(sharedReadme?.content).toBeTruthy()
    })

    it('should have description for all directories', () => {
      scaffolding.directories.forEach(dir => {
        expect(dir.description).toBeTruthy()
      })
    })

    it('should have description for all files', () => {
      scaffolding.files.forEach(file => {
        expect(file.description).toBeTruthy()
      })
    })
  })

  describe('integration', () => {
    it('should have boundaries referenced in rules', () => {
      const boundaryTags = new Set<string>()
      boundaries.forEach(b => b.tags.forEach(t => boundaryTags.add(t)))

      rules.forEach(rule => {
        // Skip wildcard and external tags
        if (rule.from.tag && rule.from.tag !== '*' && rule.from.tag !== 'external') {
          const hasTag = boundaryTags.has(rule.from.tag)
          expect(hasTag).toBe(true)
        }
        if (rule.to.tag && rule.to.tag !== '*' && rule.to.tag !== 'external') {
          const hasTag = boundaryTags.has(rule.to.tag)
          expect(hasTag).toBe(true)
        }
      })
    })

    it('should have boundaries referenced in diagram layers', () => {
      const boundaryNames = new Set(boundaries.map(b => b.name))
      diagram.layers.forEach(layer => {
        layer.boundaries.forEach(boundaryName => {
          expect(boundaryNames.has(boundaryName)).toBe(true)
        })
      })
    })

    it('should have consistent structure across components', () => {
      // Check that all components are defined
      expect(modularPreset.boundaries).toBe(boundaries)
      expect(modularPreset.rules).toBe(rules)
      expect(modularPreset.diagram).toBe(diagram)
      expect(modularPreset.scaffolding).toBe(scaffolding)
    })
  })
})
