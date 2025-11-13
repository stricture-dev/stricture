import { describe, it, expect } from 'vitest'
import { layeredPreset, boundaries, rules, diagram, scaffolding } from '../src/index.js'

describe('@stricture/layered preset', () => {
  describe('preset structure', () => {
    it('should have all required fields', () => {
      expect(layeredPreset.id).toBe('@stricture/layered')
      expect(layeredPreset.name).toBe('Layered Architecture')
      expect(layeredPreset.description).toBeTruthy()
      expect(layeredPreset.boundaries).toBeDefined()
      expect(layeredPreset.rules).toBeDefined()
      expect(layeredPreset.diagram).toBeDefined()
      expect(layeredPreset.scaffolding).toBeDefined()
    })
  })

  describe('boundaries', () => {
    it('should define 4 boundaries', () => {
      expect(boundaries).toHaveLength(4)
    })

    it('should define presentation boundary (layer 0)', () => {
      const presentation = boundaries.find(b => b.name === 'presentation')
      expect(presentation).toBeDefined()
      expect(presentation?.pattern).toBe('src/presentation/**')
      expect(presentation?.mode).toBe('file')
      expect(presentation?.tags).toContain('presentation')
      expect(presentation?.tags).toContain('ui')
      expect(presentation?.metadata?.layer).toBe(0)
    })

    it('should define application boundary (layer 1)', () => {
      const application = boundaries.find(b => b.name === 'application')
      expect(application).toBeDefined()
      expect(application?.pattern).toBe('src/application/**')
      expect(application?.mode).toBe('file')
      expect(application?.tags).toContain('application')
      expect(application?.tags).toContain('services')
      expect(application?.metadata?.layer).toBe(1)
    })

    it('should define domain boundary (layer 2)', () => {
      const domain = boundaries.find(b => b.name === 'domain')
      expect(domain).toBeDefined()
      expect(domain?.pattern).toBe('src/domain/**')
      expect(domain?.mode).toBe('file')
      expect(domain?.tags).toContain('domain')
      expect(domain?.tags).toContain('core')
      expect(domain?.metadata?.layer).toBe(2)
    })

    it('should define infrastructure boundary (layer 3)', () => {
      const infrastructure = boundaries.find(b => b.name === 'infrastructure')
      expect(infrastructure).toBeDefined()
      expect(infrastructure?.pattern).toBe('src/infrastructure/**')
      expect(infrastructure?.mode).toBe('file')
      expect(infrastructure?.tags).toContain('infrastructure')
      expect(infrastructure?.tags).toContain('data')
      expect(infrastructure?.metadata?.layer).toBe(3)
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
    it('should define 21 rules', () => {
      expect(rules).toHaveLength(21)
    })

    it('should have unique rule IDs', () => {
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    describe('presentation layer rules (layer 0 - top)', () => {
      it('should allow presentation to import itself', () => {
        const rule = rules.find(r => r.id === 'presentation-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('presentation')
        expect(rule?.to.tag).toBe('presentation')
        expect(rule?.allowed).toBe(true)
        expect(rule?.severity).toBe('error')
      })

      it('should allow presentation to depend on application', () => {
        const rule = rules.find(r => r.id === 'presentation-to-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('presentation')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow presentation to depend on domain', () => {
        const rule = rules.find(r => r.id === 'presentation-to-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('presentation')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow presentation to depend on infrastructure', () => {
        const rule = rules.find(r => r.id === 'presentation-to-infrastructure')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('presentation')
        expect(rule?.to.tag).toBe('infrastructure')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow presentation to use external libraries', () => {
        const rule = rules.find(r => r.id === 'presentation-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('presentation')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })
    })

    describe('application layer rules (layer 1)', () => {
      it('should allow application to import itself', () => {
        const rule = rules.find(r => r.id === 'application-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow application to depend on domain', () => {
        const rule = rules.find(r => r.id === 'application-to-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow application to depend on infrastructure', () => {
        const rule = rules.find(r => r.id === 'application-to-infrastructure')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('infrastructure')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow application to use external libraries', () => {
        const rule = rules.find(r => r.id === 'application-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent application from depending on presentation', () => {
        const rule = rules.find(r => r.id === 'application-not-presentation')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('presentation')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on presentation')
      })
    })

    describe('domain layer rules (layer 2)', () => {
      it('should allow domain to import itself', () => {
        const rule = rules.find(r => r.id === 'domain-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow domain to depend on infrastructure interfaces', () => {
        const rule = rules.find(r => r.id === 'domain-to-infrastructure')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('infrastructure')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow domain to use minimal external dependencies', () => {
        const rule = rules.find(r => r.id === 'domain-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent domain from depending on presentation', () => {
        const rule = rules.find(r => r.id === 'domain-not-presentation')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('presentation')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on presentation')
      })

      it('should prevent domain from depending on application', () => {
        const rule = rules.find(r => r.id === 'domain-not-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on application')
      })
    })

    describe('infrastructure layer rules (layer 3 - bottom)', () => {
      it('should allow infrastructure to import itself', () => {
        const rule = rules.find(r => r.id === 'infrastructure-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('infrastructure')
        expect(rule?.to.tag).toBe('infrastructure')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow infrastructure to use external libraries', () => {
        const rule = rules.find(r => r.id === 'infrastructure-external')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('infrastructure')
        expect(rule?.to.tag).toBe('external')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent infrastructure from depending on presentation', () => {
        const rule = rules.find(r => r.id === 'infrastructure-not-presentation')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('infrastructure')
        expect(rule?.to.tag).toBe('presentation')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on presentation')
      })

      it('should prevent infrastructure from depending on application', () => {
        const rule = rules.find(r => r.id === 'infrastructure-not-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('infrastructure')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on application')
      })

      it('should prevent infrastructure from depending on domain logic', () => {
        const rule = rules.find(r => r.id === 'infrastructure-not-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('infrastructure')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
        expect(rule?.message).toContain('cannot depend on domain')
      })
    })

    describe('type definitions rule', () => {
      it('should allow all layers to use TypeScript type definitions', () => {
        const rule = rules.find(r => r.id === 'types-external-allowed')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('*')
        expect(rule?.to.pattern).toContain('node_modules/@types/**')
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

    it('should have examples for denial rules', () => {
      const denialRules = rules.filter(r => r.allowed === false)
      denialRules.forEach(rule => {
        expect(rule.examples).toBeDefined()
        expect(rule.examples?.bad).toBeDefined()
        expect(rule.examples?.good).toBeDefined()
      })
    })
  })

  describe('diagram', () => {
    it('should be mermaid type', () => {
      expect(diagram.type).toBe('mermaid')
    })

    it('should have content', () => {
      expect(diagram.content).toBeTruthy()
      expect(diagram.content).toContain('graph')
    })

    it('should define 4 layers', () => {
      expect(diagram.layers).toHaveLength(4)
    })

    it('should have layers in correct order', () => {
      const layerNames = diagram.layers.map(l => l.name)
      expect(layerNames).toEqual([
        'Presentation',
        'Application',
        'Domain',
        'Infrastructure'
      ])
    })

    it('should have correct layer positions (0-3)', () => {
      const positions = diagram.layers.map(l => l.position)
      expect(positions).toEqual([0, 1, 2, 3])
    })

    it('should reference correct boundary names', () => {
      const boundaryNames = diagram.layers.flatMap(l => l.boundaries)
      expect(boundaryNames).toContain('presentation')
      expect(boundaryNames).toContain('application')
      expect(boundaryNames).toContain('domain')
      expect(boundaryNames).toContain('infrastructure')
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
      expect(paths).toContain('src/presentation')
      expect(paths).toContain('src/application')
      expect(paths).toContain('src/domain')
      expect(paths).toContain('src/infrastructure')
    })

    it('should include subdirectories for presentation', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/presentation/http')
      expect(paths).toContain('src/presentation/cli')
    })

    it('should include subdirectories for application', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/application/use-cases')
    })

    it('should include subdirectories for domain', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/domain/entities')
      expect(paths).toContain('src/domain/services')
    })

    it('should include subdirectories for infrastructure', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/infrastructure/repositories')
      expect(paths).toContain('src/infrastructure/external')
    })

    it('should include README files for each layer', () => {
      const paths = scaffolding.files.map(f => f.path)
      expect(paths).toContain('src/presentation/README.md')
      expect(paths).toContain('src/application/README.md')
      expect(paths).toContain('src/domain/README.md')
      expect(paths).toContain('src/infrastructure/README.md')
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

    it('should explain layered architecture in README files', () => {
      const readmeFiles = scaffolding.files.filter(f => f.path.endsWith('README.md'))
      readmeFiles.forEach(file => {
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
      expect(exports.layeredPreset).toBeDefined()
      expect(exports.boundaries).toBeDefined()
      expect(exports.rules).toBeDefined()
      expect(exports.diagram).toBeDefined()
      expect(exports.scaffolding).toBeDefined()
    })
  })
})
