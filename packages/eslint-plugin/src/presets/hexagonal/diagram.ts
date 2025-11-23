import type { DiagramDefinition } from '@stricture/core'

/**
 * Hexagonal architecture diagram
 *
 * Visual representation of the hexagonal architecture layers and their relationships.
 * Shows the dependency flow from outer layers (adapters) to inner layers (domain).
 */
export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `
graph TB
  subgraph Adapters["Adapters (Infrastructure)"]
    API[API Controllers]
    DB[Database]
    MSG[Messaging]
    EXT[External Services]
  end

  subgraph Core["Core (Business Logic)"]
    APP[Application Layer<br/>Use Cases]
    PORTS[Ports<br/>Interfaces]
    DOMAIN[Domain Layer<br/>Entities & Logic]
  end

  API --> APP
  DB --> PORTS
  MSG --> PORTS
  EXT --> PORTS
  APP --> DOMAIN
  APP --> PORTS
  PORTS -.defines.-> DOMAIN

  style DOMAIN fill:#4CAF50
  style PORTS fill:#2196F3
  style APP fill:#FF9800
  style API fill:#9C27B0
  style DB fill:#9C27B0
  style MSG fill:#9C27B0
  style EXT fill:#9C27B0
  `,
  layers: [
    {
      name: 'Domain',
      boundaries: ['domain'],
      position: 0
    },
    {
      name: 'Ports',
      boundaries: ['ports'],
      position: 1
    },
    {
      name: 'Application',
      boundaries: ['application'],
      position: 2
    },
    {
      name: 'Driving Adapters',
      boundaries: ['driving-adapters'],
      position: 3
    },
    {
      name: 'Driven Adapters',
      boundaries: ['driven-adapters'],
      position: 3
    }
  ]
}
