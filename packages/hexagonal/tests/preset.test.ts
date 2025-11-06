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
    it('should define 5 boundaries', () => {
      expect(boundaries).toHaveLength(5)
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

    it('should define driving-adapters boundary', () => {
      const drivingAdapters = boundaries.find(b => b.name === 'driving-adapters')
      expect(drivingAdapters).toBeDefined()
      expect(drivingAdapters?.pattern).toBe('src/adapters/driving/**')
      expect(drivingAdapters?.mode).toBe('file')
      expect(drivingAdapters?.tags).toContain('adapters')
      expect(drivingAdapters?.tags).toContain('driving')
      expect(drivingAdapters?.metadata?.layer).toBe(3)
    })

    it('should define driven-adapters boundary', () => {
      const drivenAdapters = boundaries.find(b => b.name === 'driven-adapters')
      expect(drivenAdapters).toBeDefined()
      expect(drivenAdapters?.pattern).toBe('src/adapters/driven/**')
      expect(drivenAdapters?.mode).toBe('file')
      expect(drivenAdapters?.tags).toContain('adapters')
      expect(drivenAdapters?.tags).toContain('driven')
      expect(drivenAdapters?.metadata?.layer).toBe(3)
    })

    it('should have unique boundary names', () => {
      const names = boundaries.map(b => b.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('rules', () => {
    it('should define 22 rules', () => {
      expect(rules).toHaveLength(22)
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
        const rule = rules.find(r => r.id === 'application-to-domain')
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

    describe('driving adapter rules', () => {
      it('should allow driving adapters to call use cases', () => {
        const rule = rules.find(r => r.id === 'driving-to-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driving')
        expect(rule?.to.tag).toBe('application')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow driving adapters to use ports', () => {
        const rule = rules.find(r => r.id === 'driving-to-ports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driving')
        expect(rule?.to.tag).toBe('ports')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent driving adapters from importing driven adapters', () => {
        const rule = rules.find(r => r.id === 'driving-not-driven')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driving')
        expect(rule?.to.tag).toBe('driven')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
      })

      it('should prevent driving adapters from importing domain directly', () => {
        const rule = rules.find(r => r.id === 'driving-not-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driving')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(false)
        expect(rule?.message).toBeTruthy()
      })
    })

    describe('driven adapter rules', () => {
      it('should allow driven adapters to implement ports', () => {
        const rule = rules.find(r => r.id === 'driven-implements-ports')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driven')
        expect(rule?.to.tag).toBe('ports')
        expect(rule?.allowed).toBe(true)
      })

      it('should allow driven adapters to use domain types', () => {
        const rule = rules.find(r => r.id === 'driven-to-domain')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driven')
        expect(rule?.to.tag).toBe('domain')
        expect(rule?.allowed).toBe(true)
      })

      it('should prevent driven adapters from calling use cases', () => {
        const rule = rules.find(r => r.id === 'driven-not-application')
        expect(rule).toBeDefined()
        expect(rule?.from.tag).toBe('driven')
        expect(rule?.to.tag).toBe('application')
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

    it('should define 5 layers', () => {
      expect(diagram.layers).toHaveLength(5)
    })

    it('should have layers in correct order', () => {
      const layerNames = diagram.layers.map(l => l.name)
      expect(layerNames).toEqual(['Domain', 'Ports', 'Application', 'Driving Adapters', 'Driven Adapters'])
    })

    it('should have correct layer positions', () => {
      const positions = diagram.layers.map(l => l.position)
      expect(positions).toEqual([0, 1, 2, 3, 3])
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
      expect(paths).toContain('src/adapters/driving')
      expect(paths).toContain('src/adapters/driven')
    })

    it('should include README files for each layer', () => {
      const paths = scaffolding.files.map(f => f.path)
      expect(paths).toContain('src/core/domain/README.md')
      expect(paths).toContain('src/core/ports/README.md')
      expect(paths).toContain('src/core/application/README.md')
      expect(paths).toContain('src/adapters/driving/README.md')
      expect(paths).toContain('src/adapters/driven/README.md')
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
