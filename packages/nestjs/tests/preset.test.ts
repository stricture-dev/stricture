import { describe, it, expect } from 'vitest'
import { nestjsPreset } from '../src/index.js'

describe('@stricture/nestjs preset', () => {
  it('should export a valid preset', () => {
    expect(nestjsPreset).toBeDefined()
    expect(nestjsPreset.id).toBe('@stricture/nestjs')
    expect(nestjsPreset.name).toBe('NestJS Architecture')
    expect(nestjsPreset.description).toContain('NestJS')
  })

  it('should have boundaries defined', () => {
    expect(nestjsPreset.boundaries).toBeDefined()
    expect(Array.isArray(nestjsPreset.boundaries)).toBe(true)
    expect(nestjsPreset.boundaries.length).toBeGreaterThan(0)
  })

  it('should have rules defined', () => {
    expect(nestjsPreset.rules).toBeDefined()
    expect(Array.isArray(nestjsPreset.rules)).toBe(true)
    expect(nestjsPreset.rules.length).toBeGreaterThan(0)
  })

  it('should have diagram defined', () => {
    expect(nestjsPreset.diagram).toBeDefined()
    expect(nestjsPreset.diagram?.type).toBe('mermaid')
    expect(nestjsPreset.diagram?.content).toContain('graph')
  })

  it('should have scaffolding defined', () => {
    expect(nestjsPreset.scaffolding).toBeDefined()
    expect(nestjsPreset.scaffolding?.directories).toBeDefined()
    expect(nestjsPreset.scaffolding?.files).toBeDefined()
  })

  it('should define controllers boundary', () => {
    const controllersBoundary = nestjsPreset.boundaries.find(b => b.name === 'controllers')
    expect(controllersBoundary).toBeDefined()
    expect(controllersBoundary?.pattern).toBe('src/**/*.controller.ts')
    expect(controllersBoundary?.mode).toBe('file')
    expect(controllersBoundary?.tags).toContain('controllers')
  })

  it('should define services boundary', () => {
    const servicesBoundary = nestjsPreset.boundaries.find(b => b.name === 'services')
    expect(servicesBoundary).toBeDefined()
    expect(servicesBoundary?.pattern).toBe('src/**/*.service.ts')
    expect(servicesBoundary?.mode).toBe('file')
    expect(servicesBoundary?.tags).toContain('services')
  })

  it('should define dtos boundary', () => {
    const dtosBoundary = nestjsPreset.boundaries.find(b => b.name === 'dtos')
    expect(dtosBoundary).toBeDefined()
    expect(dtosBoundary?.pattern).toBe('src/**/dto/**')
    expect(dtosBoundary?.mode).toBe('file')
    expect(dtosBoundary?.tags).toContain('dtos')
  })

  it('should define entities boundary', () => {
    const entitiesBoundary = nestjsPreset.boundaries.find(b => b.name === 'entities')
    expect(entitiesBoundary).toBeDefined()
    expect(entitiesBoundary?.pattern).toBe('src/**/entities/**')
    expect(entitiesBoundary?.mode).toBe('file')
    expect(entitiesBoundary?.tags).toContain('entities')
  })

  it('should have unique rule IDs', () => {
    const ruleIds = nestjsPreset.rules.map(r => r.id)
    const uniqueIds = new Set(ruleIds)
    expect(ruleIds.length).toBe(uniqueIds.size)
  })

  it('should have dtos-not-entities rule', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'dtos-not-entities')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(false)
    expect(rule?.from.tag).toBe('dtos')
    expect(rule?.to.tag).toBe('entities')
  })

  it('should have controllers-not-entities rule', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'controllers-not-entities')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(false)
    expect(rule?.from.tag).toBe('controllers')
    expect(rule?.to.tag).toBe('entities')
  })

  it('should have controllers-not-repositories rule', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'controllers-not-repositories')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(false)
    expect(rule?.from.tag).toBe('controllers')
    expect(rule?.to.tag).toBe('repositories')
  })

  it('should allow controllers to call services', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'controllers-to-services')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(true)
    expect(rule?.from.tag).toBe('controllers')
    expect(rule?.to.tag).toBe('services')
  })

  it('should allow services to use entities', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'services-to-entities')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(true)
    expect(rule?.from.tag).toBe('services')
    expect(rule?.to.tag).toBe('entities')
  })

  it('should allow services to use repositories', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'services-to-repositories')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(true)
    expect(rule?.from.tag).toBe('services')
    expect(rule?.to.tag).toBe('repositories')
  })

  it('should allow common to be used everywhere', () => {
    const rule = nestjsPreset.rules.find(r => r.id === 'any-to-common')
    expect(rule).toBeDefined()
    expect(rule?.allowed).toBe(true)
    expect(rule?.from.tag).toBe('*')
    expect(rule?.to.tag).toBe('common')
  })
})
