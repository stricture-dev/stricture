/**
 * NestJS-specific type definitions
 *
 * These types are for documentation and IDE support.
 * They don't affect runtime behavior.
 */

/**
 * NestJS boundary types
 */
export type NestJSBoundary =
  | 'controllers'
  | 'services'
  | 'dtos'
  | 'entities'
  | 'repositories'
  | 'guards'
  | 'interceptors'
  | 'pipes'
  | 'decorators'
  | 'common'
  | 'config'

/**
 * Module definition metadata
 */
export interface ModuleDefinition {
  name: string
  controllers?: string[]
  services?: string[]
  repositories?: string[]
  exports?: string[]
}

/**
 * Controller definition metadata
 */
export interface ControllerDefinition {
  name: string
  path: string
  methods: {
    name: string
    httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path?: string
  }[]
}

/**
 * Service definition metadata
 */
export interface ServiceDefinition {
  name: string
  dependencies: string[]
  methods: string[]
}

/**
 * DTO definition metadata
 */
export interface DTODefinition {
  name: string
  type: 'input' | 'output' | 'both'
  properties: {
    name: string
    type: string
    required: boolean
    validation?: string[]
  }[]
}

/**
 * Entity definition metadata
 */
export interface EntityDefinition {
  name: string
  tableName?: string
  properties: {
    name: string
    type: string
    primary?: boolean
    nullable?: boolean
  }[]
  relationships?: {
    name: string
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
    target: string
  }[]
}
