import { describe, it, expect } from 'vitest'
import { cleanPreset, boundaries, rules, diagram, scaffolding } from '../src/index.js'

describe('@stricture/clean preset', () => {
  describe('preset structure', () => {
    it('should have all required fields', () => {
      expect(cleanPreset.id).toBe('@stricture/clean')
      expect(cleanPreset.name).toBe('Clean Architecture')
      expect(cleanPreset.description).toBeTruthy()
      expect(cleanPreset.boundaries).toBeDefined()
      expect(cleanPreset.rules).toBeDefined()
      expect(cleanPreset.diagram).toBeDefined()
      expect(cleanPreset.scaffolding).toBeDefined()
    })
  })

  describe('boundaries', () => {
    it('should define 4 boundaries', () => {
      expect(boundaries).toHaveLength(4)
    })

    it('should define entities boundary (layer 0)', () => {
      const entities = boundaries.find(b => b.name === 'entities')
      expect(entities).toBeDefined()
      expect(entities?.pattern).toBe('src/entities/**')
      expect(entities?.mode).toBe('file')
      expect(entities?.tags).toContain('entities')
      expect(entities?.tags).toContain('core')
      expect(entities?.metadata?.layer).toBe(0)
    })

    it('should define use-cases boundary (layer 1)', () => {
      const useCases = boundaries.find(b => b.name === 'use-cases')
      expect(useCases).toBeDefined()
      expect(useCases?.pattern).toBe('src/use-cases/**')
      expect(useCases?.mode).toBe('file')
      expect(useCases?.tags).toContain('use-cases')
      expect(useCases?.tags).toContain('core')
      expect(useCases?.metadata?.layer).toBe(1)
    })

    it('should define interface-adapters boundary (layer 2)', () => {
      const interfaceAdapters = boundaries.find(b => b.name === 'interface-adapters')
      expect(interfaceAdapters).toBeDefined()
      expect(interfaceAdapters?.pattern).toBe('src/interface-adapters/**')
      expect(interfaceAdapters?.mode).toBe('file')
      expect(interfaceAdapters?.tags).toContain('interface-adapters')
      expect(interfaceAdapters?.tags).toContain('adapters')
      expect(interfaceAdapters?.metadata?.layer).toBe(2)
    })

    it('should define frameworks-drivers boundary (layer 3)', () => {
      const frameworksDrivers = boundaries.find(b => b.name === 'frameworks-drivers')
      expect(frameworksDrivers).toBeDefined()
      expect(frameworksDrivers?.pattern).toBe('src/frameworks-drivers/**')
      expect(frameworksDrivers?.mode).toBe('file')
      expect(frameworksDrivers?.tags).toContain('frameworks-drivers')
      expect(frameworksDrivers?.tags).toContain('infrastructure')
      expect(frameworksDrivers?.metadata?.layer).toBe(3)
    })

    it('should have layers in correct order (0-3)', () => {
      const layers = boundaries.map(b => b.metadata?.layer).sort()
      expect(layers).toEqual([0, 1, 2, 3])
    })

    it('should have unique boundary names', () => {
      const names = boundaries.map(b => b.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('rules', () => {
    it('should define 17 rules', () => {
      expect(rules).toHaveLength(17)
    })

    it('should have unique rule IDs', () => {
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have entities-self-imports before entities-isolation', () => {
      const selfImportsIndex = rules.findIndex(r => r.id === 'entities-self-imports')
      const isolationIndex = rules.findIndex(r => r.id === 'entities-isolation')
      expect(selfImportsIndex).toBeGreaterThanOrEqual(0)
      expect(isolationIndex).toBeGreaterThan(selfImportsIndex)
    })

    describe('entities layer rules (layer 0)', () => {
      it('should allow entities to import entities', () => {
        const rule = rules.find(r => r.id === 'entities-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('entities')
        expect(rule?.to.tag).toBe('entities')
        expect(rule?.allowed).toBe(true)
        expect(rule?.severity).toBe('error')
      })

      it('should prevent entities from importing anything external', () => {
        const rule = rules.find(r => r.id === 'entities-isolation')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('entities')
        expect(rule?.to.tag).toBe('*')
        expect(rule?.allowed).toBe(false)
        expect(rule?.severity).toBe('error')
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('zero dependencies')
      })
    })

    describe('use-cases layer rules (layer 1)', () => {
      it('should allow use-cases to depend on entities', () => {
        const rule = rules.find(r => r.id === 'use-cases-to-entities')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('use-cases')
        expect(rule?.to.tag).toBe('entities')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow use-cases to import each other', () => {
        const rule = rules.find(r => r.id === 'use-cases-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('use-cases')
        expect(rule?.to.tag).toBe('use-cases')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow use-cases to use external libraries', () => {
        const rule = rules.find(r => r.id === 'use-cases-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('use-cases')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent use-cases from depending on interface-adapters', () => {
        const rule = rules.find(r => r.id === 'use-cases-not-interface-adapters')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('use-cases')
        expect(rule?.to.tag).toBe('interface-adapters')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('INWARD')
      })

      it('should prevent use-cases from depending on frameworks', () => {
        const rule = rules.find(r => r.id === 'use-cases-not-frameworks')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('use-cases')
        expect(rule?.to.tag).toBe('frameworks-drivers')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('framework-independent')
      })
    })

    describe('interface-adapters layer rules (layer 2)', () => {
      it('should allow interface-adapters to depend on use-cases', () => {
        const rule = rules.find(r => r.id === 'interface-adapters-to-use-cases')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('interface-adapters')
        expect(rule?.to.tag).toBe('use-cases')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow interface-adapters to depend on entities', () => {
        const rule = rules.find(r => r.id === 'interface-adapters-to-entities')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('interface-adapters')
        expect(rule?.to.tag).toBe('entities')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow interface-adapters to import each other', () => {
        const rule = rules.find(r => r.id === 'interface-adapters-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('interface-adapters')
        expect(rule?.to.tag).toBe('interface-adapters')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow interface-adapters to use external libraries', () => {
        const rule = rules.find(r => r.id === 'interface-adapters-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('interface-adapters')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent interface-adapters from depending on frameworks directly', () => {
        const rule = rules.find(r => r.id === 'interface-adapters-not-frameworks')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('interface-adapters')
        expect(rule?.to.tag).toBe('frameworks-drivers')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('dependency injection')
      })
    })

    describe('frameworks-drivers layer rules (layer 3)', () => {
      it('should allow frameworks to depend on interface-adapters', () => {
        const rule = rules.find(r => r.id === 'frameworks-to-interface-adapters')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('frameworks-drivers')
        expect(rule?.to.tag).toBe('interface-adapters')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow frameworks to depend on use-cases', () => {
        const rule = rules.find(r => r.id === 'frameworks-to-use-cases')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('frameworks-drivers')
        expect(rule?.to.tag).toBe('use-cases')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow frameworks to depend on entities', () => {
        const rule = rules.find(r => r.id === 'frameworks-to-entities')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('frameworks-drivers')
        expect(rule?.to.tag).toBe('entities')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow frameworks to import each other', () => {
        const rule = rules.find(r => r.id === 'frameworks-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('frameworks-drivers')
        expect(rule?.to.tag).toBe('frameworks-drivers')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow frameworks to use external libraries', () => {
        const rule = rules.find(r => r.id === 'frameworks-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('frameworks-drivers')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })
    })

    it('should have severity set for all rules', () => {
      rules.forEach(rule => {
        expect(rule.severity).toBeDefined()
        expect(['error', 'warning', 'info']).toContain(rule.severity)
      })
    })

    it('should have messages for all denial rules', () => {
      const denialRules = rules.filter(r => r.allowed === false)
      denialRules.forEach(rule => {
        expect(rule.message).toBeTruthy()
        expect(rule.message!.length).toBeGreaterThan(10)
      })
    })
  })

  describe('diagram', () => {
    it('should be mermaid type', () => {
      expect(diagram.type).toBe('mermaid')
    })

    it('should have content', () => {
      expect(diagram.content).toBeTruthy()
      expect(diagram.content).toContain('graph TD')
    })

    it('should define 4 layers', () => {
      expect(diagram.layers).toHaveLength(4)
    })

    it('should have layers in correct order', () => {
      const layerNames = diagram.layers.map(l => l.name)
      expect(layerNames).toEqual([
        'Entities',
        'Use Cases',
        'Interface Adapters',
        'Frameworks & Drivers'
      ])
    })

    it('should have correct layer positions (0-3)', () => {
      const positions = diagram.layers.map(l => l.position)
      expect(positions).toEqual([0, 1, 2, 3])
    })

    it('should reference correct boundary names', () => {
      const boundaryNames = diagram.layers.flatMap(l => l.boundaries)
      expect(boundaryNames).toContain('entities')
      expect(boundaryNames).toContain('use-cases')
      expect(boundaryNames).toContain('interface-adapters')
      expect(boundaryNames).toContain('frameworks-drivers')
    })
  })

  describe('scaffolding', () => {
    it('should define directories', () => {
      expect(scaffolding.directories).toBeDefined()
      expect(scaffolding.directories.length).toBeGreaterThan(0)
    })

    it('should define files', () => {
      expect(scaffolding.files).toBeDefined()
      expect(scaffolding.files.length).toBeGreaterThan(0)
    })

    it('should include all layer directories', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/entities')
      expect(paths).toContain('src/use-cases')
      expect(paths).toContain('src/interface-adapters')
      expect(paths).toContain('src/frameworks-drivers')
    })

    it('should include subdirectories for use-cases', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/use-cases/input-ports')
      expect(paths).toContain('src/use-cases/output-ports')
    })

    it('should include subdirectories for interface-adapters', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/interface-adapters/controllers')
      expect(paths).toContain('src/interface-adapters/presenters')
      expect(paths).toContain('src/interface-adapters/gateways')
    })

    it('should include subdirectories for frameworks-drivers', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/frameworks-drivers/web')
      expect(paths).toContain('src/frameworks-drivers/database')
      expect(paths).toContain('src/frameworks-drivers/cli')
    })

    it('should include README files for each layer', () => {
      const paths = scaffolding.files.map(f => f.path)
      expect(paths).toContain('src/entities/README.md')
      expect(paths).toContain('src/use-cases/README.md')
      expect(paths).toContain('src/interface-adapters/README.md')
      expect(paths).toContain('src/frameworks-drivers/README.md')
    })

    it('should have content for all files', () => {
      scaffolding.files.forEach(file => {
        expect(file.content).toBeTruthy()
        expect(file.content.length).toBeGreaterThan(50)
      })
    })

    it('should have descriptions for all directories', () => {
      scaffolding.directories.forEach(dir => {
        expect(dir.description).toBeTruthy()
      })
    })

    it('should explain the Dependency Rule in README files', () => {
      const readmeFiles = scaffolding.files.filter(f => f.path.endsWith('README.md'))
      readmeFiles.forEach(file => {
        // Check that key concepts are mentioned
        expect(
          file.content.toLowerCase().includes('layer') ||
            file.content.toLowerCase().includes('business') ||
            file.content.toLowerCase().includes('dependency')
        ).toBe(true)
      })
    })
  })

  describe('type exports', () => {
    it('should export all required types', async () => {
      const exports = await import('../src/index.js')
      // Check type exports exist (they're type-only so we can't runtime check them)
      expect(exports.cleanPreset).toBeDefined()
      expect(exports.boundaries).toBeDefined()
      expect(exports.rules).toBeDefined()
      expect(exports.diagram).toBeDefined()
      expect(exports.scaffolding).toBeDefined()
    })
  })
})
