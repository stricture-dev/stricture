import { describe, it, expect } from 'vitest'
import { hexagonalPreset, boundaries, rules, diagram, scaffolding } from '../src'

describe('@stricture/hexagonal preset', () => {
  describe('preset structure', () => {
    it('should have all required fields', () => {
      expect(hexagonalPreset.id).toBe('@stricture/hexagonal')
      expect(hexagonalPreset.name).toBe('Hexagonal Architecture')
      expect(hexagonalPreset.description).toBeTruthy()
      expect(hexagonalPreset.boundaries).toBeDefined()
      expect(hexagonalPreset.rules).toBeDefined()
      expect(hexagonalPreset.diagram).toBeDefined()
      expect(hexagonalPreset.scaffolding).toBeDefined()
    })
  })

  describe('boundaries', () => {
    it('should define 4 boundaries', () => {
      expect(boundaries).toHaveLength(4)
    })

    it('should define domain boundary', () => {
      const domain = boundaries.find(b => b.name === 'domain')
      expect(domain).toBeDefined()
      expect(domain?.pattern).toBe('src/core/domain/**')
      expect(domain?.mode).toBe('file')
      expect(domain?.tags).toContain('domain')
      expect(domain?.tags).toContain('core')
      expect(domain?.metadata?.layer).toBe(0)
    })

    it('should define ports boundary', () => {
      const ports = boundaries.find(b => b.name === 'ports')
      expect(ports).toBeDefined()
      expect(ports?.pattern).toBe('src/core/ports/**')
      expect(ports?.mode).toBe('file')
      expect(ports?.tags).toContain('ports')
      expect(ports?.tags).toContain('core')
      expect(ports?.metadata?.layer).toBe(1)
    })

    it('should define application boundary', () => {
      const application = boundaries.find(b => b.name === 'application')
      expect(application).toBeDefined()
      expect(application?.pattern).toBe('src/core/application/**')
      expect(application?.mode).toBe('file')
      expect(application?.tags).toContain('application')
      expect(application?.tags).toContain('core')
      expect(application?.metadata?.layer).toBe(2)
    })

    it('should define adapters boundary', () => {
      const adapters = boundaries.find(b => b.name === 'adapters')
      expect(adapters).toBeDefined()
      expect(adapters?.pattern).toBe('src/adapters/**')
      expect(adapters?.mode).toBe('file')
      expect(adapters?.tags).toContain('adapters')
      expect(adapters?.metadata?.layer).toBe(3)
    })

    it('should have unique boundary names', () => {
      const names = boundaries.map(b => b.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('rules', () => {
    it('should define 9 rules', () => {
      expect(rules).toHaveLength(9)
    })

    it('should have unique rule IDs', () => {
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have domain-self-imports before domain-isolation', () => {
      const selfImportsIndex = rules.findIndex(r => r.id === 'domain-self-imports')
      const isolationIndex = rules.findIndex(r => r.id === 'domain-isolation')
      expect(selfImportsIndex).toBeGreaterThanOrEqual(0)
      expect(isolationIndex).toBeGreaterThan(selfImportsIndex)
    })

    describe('domain-self-imports rule', () => {
      it('should allow domain to import domain', () => {
        const rule = rules.find(r => r.id === 'domain-self-imports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
        expect(rule?.severity).toBe('error')
      })
    })

    describe('domain-isolation rule', () => {
      it('should prevent domain from importing anything external', () => {
        const rule = rules.find(r => r.id === 'domain-isolation')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('domain')
        expect(rule?.to.tag).toBe('*')
        expect(rule?.allowed).toBe(false)
        expect(rule?.severity).toBe('error')
        expect(rule?.message).toBeTruthy()
      })
    })

    describe('ports-to-domain rule', () => {
      it('should allow ports to reference domain', () => {
        const rule = rules.find(r => r.id === 'ports-to-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('ports')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })
    })

    describe('application rules', () => {
      it('should allow application to import domain', () => {
        const rule = rules.find(r => r.id === 'application-to-core')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow application to import ports', () => {
        const rule = rules.find(r => r.id === 'application-to-ports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('ports')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent application from importing adapters', () => {
        const rule = rules.find(r => r.id === 'application-not-adapters')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('application')
        expect(rule?.to.tag).toBe('adapters')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
      })
    })

    describe('adapter rules', () => {
      it('should allow adapters to implement ports', () => {
        const rule = rules.find(r => r.id === 'adapters-to-ports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('adapters')
        expect(rule?.to.tag).toBe('ports')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow adapters to use application', () => {
        const rule = rules.find(r => r.id === 'adapters-to-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('adapters')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent adapters from importing domain directly', () => {
        const rule = rules.find(r => r.id === 'adapters-not-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('adapters')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
      })
    })

    it('should have severity set for all rules', () => {
      rules.forEach(rule => {
        expect(rule.severity).toBeDefined()
        expect(['error', 'warning', 'info']).toContain(rule.severity)
      })
    })
  })

  describe('diagram', () => {
    it('should be mermaid type', () => {
      expect(diagram.type).toBe('mermaid')
    })

    it('should have content', () => {
      expect(diagram.content).toBeTruthy()
      expect(diagram.content).toContain('graph TB')
    })

    it('should define 4 layers', () => {
      expect(diagram.layers).toHaveLength(4)
    })

    it('should have layers in correct order', () => {
      const layerNames = diagram.layers.map(l => l.name)
      expect(layerNames).toEqual(['Domain', 'Ports', 'Application', 'Adapters'])
    })

    it('should have correct layer positions', () => {
      const positions = diagram.layers.map(l => l.position)
      expect(positions).toEqual([0, 1, 2, 3])
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

    it('should include core directories', () => {
      const paths = scaffolding.directories.map(d => d.path)
      expect(paths).toContain('src/core/domain')
      expect(paths).toContain('src/core/ports')
      expect(paths).toContain('src/core/application')
      expect(paths).toContain('src/adapters')
    })

    it('should include README files for each layer', () => {
      const paths = scaffolding.files.map(f => f.path)
      expect(paths).toContain('src/core/domain/README.md')
      expect(paths).toContain('src/core/ports/README.md')
      expect(paths).toContain('src/core/application/README.md')
      expect(paths).toContain('src/adapters/README.md')
    })

    it('should have content for all files', () => {
      scaffolding.files.forEach(file => {
        expect(file.content).toBeTruthy()
        expect(file.content.length).toBeGreaterThan(0)
      })
    })

    it('should have descriptions for all directories', () => {
      scaffolding.directories.forEach(dir => {
        expect(dir.description).toBeTruthy()
      })
    })
  })
})
