/**
 * Architecture diagram representation
 */
export interface DiagramDefinition {
  type: 'mermaid' | 'svg' | 'ascii'
  content: string
  layers?: {
    name: string
    boundaries: string[] // Boundary names in this layer
    position: number // Vertical position
  }[]
}

/**
 * Template for generating project structure
 */
export interface ScaffoldingTemplate {
  directories: {
    path: string
    description?: string
  }[]
  files?: {
    path: string
    content: string
    description?: string
  }[]
}
