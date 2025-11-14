import { describe, it, expect } from 'vitest'
import { nextjsPreset, boundaries, rules, diagram, scaffolding } from '../src/index.js'

describe('@stricture/nextjs preset', () => {
  describe('preset structure', () => {
    it('should have all required fields', () => {
      expect(nextjsPreset.id).toBe('@stricture/nextjs')
      expect(nextjsPreset.name).toBe('Next.js Architecture')
      expect(nextjsPreset.description).toBeTruthy()
      expect(nextjsPreset.boundaries).toBeDefined()
      expect(nextjsPreset.rules).toBeDefined()
      expect(nextjsPreset.diagram).toBeDefined()
      expect(nextjsPreset.scaffolding).toBeDefined()
    })
  })

  describe('boundaries', () => {
    it('should define 7 boundaries', () => {
      expect(boundaries).toHaveLength(7)
    })

    it('should define server-components boundary', () => {
      const serverComponents = boundaries.find(b => b.name === 'server-components')
      expect(serverComponents).toBeDefined()
      expect(serverComponents?.pattern).toBe('components/server/**')
      expect(serverComponents?.mode).toBe('file')
      expect(serverComponents?.tags).toContain('server')
      expect(serverComponents?.tags).toContain('components')
      expect(serverComponents?.metadata?.runtime).toBe('server')
    })

    it('should define client-components boundary', () => {
      const clientComponents = boundaries.find(b => b.name === 'client-components')
      expect(clientComponents).toBeDefined()
      expect(clientComponents?.pattern).toBe('components/client/**')
      expect(clientComponents?.mode).toBe('file')
      expect(clientComponents?.tags).toContain('client')
      expect(clientComponents?.tags).toContain('components')
      expect(clientComponents?.metadata?.runtime).toBe('client')
    })

    it('should define app-routes boundary', () => {
      const appRoutes = boundaries.find(b => b.name === 'app-routes')
      expect(appRoutes).toBeDefined()
      expect(appRoutes?.pattern).toContain('app/')
      expect(appRoutes?.mode).toBe('file')
      expect(appRoutes?.tags).toContain('app')
      expect(appRoutes?.tags).toContain('routes')
      expect(appRoutes?.metadata?.runtime).toBe('server')
    })

    it('should define api-routes boundary', () => {
      const apiRoutes = boundaries.find(b => b.name === 'api-routes')
      expect(apiRoutes).toBeDefined()
      expect(apiRoutes?.pattern).toBe('app/api/**')
      expect(apiRoutes?.mode).toBe('file')
      expect(apiRoutes?.tags).toContain('api')
      expect(apiRoutes?.tags).toContain('server')
      expect(apiRoutes?.metadata?.runtime).toBe('server')
    })

    it('should define server-utils boundary', () => {
      const serverUtils = boundaries.find(b => b.name === 'server-utils')
      expect(serverUtils).toBeDefined()
      expect(serverUtils?.pattern).toBe('lib/server/**')
      expect(serverUtils?.mode).toBe('file')
      expect(serverUtils?.tags).toContain('lib')
      expect(serverUtils?.tags).toContain('server')
      expect(serverUtils?.metadata?.runtime).toBe('server')
    })

    it('should define shared-utils boundary', () => {
      const sharedUtils = boundaries.find(b => b.name === 'shared-utils')
      expect(sharedUtils).toBeDefined()
      expect(sharedUtils?.pattern).toContain('lib/')
      expect(sharedUtils?.mode).toBe('file')
      expect(sharedUtils?.tags).toContain('lib')
      expect(sharedUtils?.tags).toContain('shared')
      expect(sharedUtils?.metadata?.runtime).toBe('universal')
    })

    it('should define server-actions boundary', () => {
      const serverActions = boundaries.find(b => b.name === 'server-actions')
      expect(serverActions).toBeDefined()
      expect(serverActions?.pattern).toBe('actions/**')
      expect(serverActions?.mode).toBe('file')
      expect(serverActions?.tags).toContain('actions')
      expect(serverActions?.tags).toContain('server')
      expect(serverActions?.metadata?.runtime).toBe('server')
    })

    it('should have unique boundary names', () => {
      const names = boundaries.map(b => b.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  describe('rules', () => {
    it('should define 20 rules', () => {
      expect(rules).toHaveLength(20)
    })

    it('should have unique rule IDs', () => {
      const ids = rules.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    describe('critical restriction rules', () => {
      describe('client-no-server-utils rule', () => {
        it('should forbid client components from importing server utils', () => {
          const rule = rules.find(r => r.id === 'client-no-server-utils')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('client')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(false)
          expect(rule?.message).toBeTruthy()
          expect(rule?.examples?.bad).toBeDefined()
          expect(rule?.examples?.good).toBeDefined()
        })
      })

      describe('client-no-api rule', () => {
        it('should forbid client components from importing api routes', () => {
          const rule = rules.find(r => r.id === 'client-no-api')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('client')
          expect(rule?.to.tag).toBe('api')
          expect(rule?.allowed).toBe(false)
          expect(rule?.message).toBeTruthy()
          expect(rule?.examples).toBeDefined()
        })
      })

      describe('api-no-components rule', () => {
        it('should forbid api routes from importing components', () => {
          const rule = rules.find(r => r.id === 'api-no-components')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('api')
          expect(rule?.to.tag).toBe('components')
          expect(rule?.allowed).toBe(false)
          expect(rule?.message).toBeTruthy()
          expect(rule?.examples).toBeDefined()
        })
      })
    })

    describe('allowed import rules', () => {
      describe('client-to-server-actions rule', () => {
        it('should allow client components to import server actions', () => {
          const rule = rules.find(r => r.id === 'client-to-server-actions')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('client')
          expect(rule?.to.tag).toBe('actions')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('server-components-to-server-utils rule', () => {
        it('should allow server components to import server utils', () => {
          const rule = rules.find(r => r.id === 'server-components-to-server-utils')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('server')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('server-to-client-components rule', () => {
        it('should allow server components to import client components', () => {
          const rule = rules.find(r => r.id === 'server-to-client-components')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('server')
          expect(rule?.to.tag).toBe('client')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('client-self-imports rule', () => {
        it('should allow client components to import each other', () => {
          const rule = rules.find(r => r.id === 'client-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('client')
          expect(rule?.to.tag).toBe('client')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('server-self-imports rule', () => {
        it('should allow server components to import each other', () => {
          const rule = rules.find(r => r.id === 'server-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('server')
          expect(rule?.to.tag).toBe('server')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('api-to-server-utils rule', () => {
        it('should allow api routes to import server utils', () => {
          const rule = rules.find(r => r.id === 'api-to-server-utils')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('api')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('api-self-imports rule', () => {
        it('should allow api routes to import each other', () => {
          const rule = rules.find(r => r.id === 'api-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('api')
          expect(rule?.to.tag).toBe('api')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('all-to-shared rule', () => {
        it('should allow all code to import shared utilities', () => {
          const rule = rules.find(r => r.id === 'all-to-shared')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('*')
          expect(rule?.to.tag).toBe('shared')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('app-routes-to-server-utils rule', () => {
        it('should allow app routes to import server utils', () => {
          const rule = rules.find(r => r.id === 'app-routes-to-server-utils')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('routes')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('app-routes-to-components rule', () => {
        it('should allow app routes to import components', () => {
          const rule = rules.find(r => r.id === 'app-routes-to-components')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('routes')
          expect(rule?.to.tag).toBe('components')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('app-routes-to-actions rule', () => {
        it('should allow app routes to import server actions', () => {
          const rule = rules.find(r => r.id === 'app-routes-to-actions')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('routes')
          expect(rule?.to.tag).toBe('actions')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('actions-to-server-utils rule', () => {
        it('should allow server actions to import server utils', () => {
          const rule = rules.find(r => r.id === 'actions-to-server-utils')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('actions')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('actions-self-imports rule', () => {
        it('should allow server actions to import each other', () => {
          const rule = rules.find(r => r.id === 'actions-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('actions')
          expect(rule?.to.tag).toBe('actions')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('all-to-external rule', () => {
        it('should allow all code to import external dependencies', () => {
          const rule = rules.find(r => r.id === 'all-to-external')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('*')
          expect(rule?.to.tag).toBe('external')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('app-routes-self-imports rule', () => {
        it('should allow app routes to import each other', () => {
          const rule = rules.find(r => r.id === 'app-routes-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('routes')
          expect(rule?.to.tag).toBe('routes')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('server-utils-self-imports rule', () => {
        it('should allow server utils to import each other', () => {
          const rule = rules.find(r => r.id === 'server-utils-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('server-utils')
          expect(rule?.to.tag).toBe('server-utils')
          expect(rule?.allowed).toBe(true)
        })
      })

      describe('shared-self-imports rule', () => {
        it('should allow shared utils to import each other', () => {
          const rule = rules.find(r => r.id === 'shared-self-imports')
          expect(rule).toBeDefined()
          expect(rule?.from.tag).toBe('shared')
          expect(rule?.to.tag).toBe('shared')
          expect(rule?.allowed).toBe(true)
        })
      })
    })

    describe('rule properties', () => {
      it('should have severity for all rules', () => {
        rules.forEach(rule => {
          expect(rule.severity).toBe('error')
        })
      })

      it('should have descriptions for all rules', () => {
        rules.forEach(rule => {
          expect(rule.description).toBeTruthy()
          expect(rule.description.length).toBeGreaterThan(0)
        })
      })

      it('should have names for all rules', () => {
        rules.forEach(rule => {
          expect(rule.name).toBeTruthy()
          expect(rule.name.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('diagram', () => {
    it('should have mermaid type', () => {
      expect(diagram.type).toBe('mermaid')
    })

    it('should have content', () => {
      expect(diagram.content).toBeTruthy()
      expect(diagram.content.length).toBeGreaterThan(0)
    })

    it('should define layers', () => {
      expect(diagram.layers).toBeDefined()
      expect(Array.isArray(diagram.layers)).toBe(true)
      expect(diagram.layers.length).toBeGreaterThan(0)
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

    it('should include key directories', () => {
      const dirPaths = scaffolding.directories.map(d => d.path)
      expect(dirPaths).toContain('components/server')
      expect(dirPaths).toContain('components/client')
      expect(dirPaths).toContain('lib/server')
      expect(dirPaths).toContain('actions')
      expect(dirPaths).toContain('app/api')
    })

    it('should have descriptions for all directories', () => {
      scaffolding.directories.forEach(dir => {
        expect(dir.description).toBeTruthy()
      })
    })

    it('should have descriptions for all files', () => {
      scaffolding.files.forEach(file => {
        expect(file.description).toBeTruthy()
      })
    })
  })
})
