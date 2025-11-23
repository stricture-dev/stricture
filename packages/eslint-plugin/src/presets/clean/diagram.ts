import type { DiagramDefinition } from '@stricture/core'

/**
 * Clean Architecture diagram
 *
 * Visual representation of the concentric circles of Clean Architecture.
 * Shows the Dependency Rule: dependencies point INWARD only.
 *
 * The four circles from inside to outside:
 * 1. Entities (innermost - yellow/gold)
 * 2. Use Cases (blue)
 * 3. Interface Adapters (orange)
 * 4. Frameworks & Drivers (outermost - purple)
 */
export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `
graph TD
  subgraph Outer["Frameworks & Drivers (Layer 3)"]
    WEB[Web Framework]
    DB[Database]
    UI[UI Framework]
    EXT[External APIs]
  end

  subgraph Adapters["Interface Adapters (Layer 2)"]
    CTRL[Controllers]
    PRES[Presenters]
    GATE[Gateways]
  end

  subgraph UseCases["Use Cases (Layer 1)"]
    UC1[Create Order]
    UC2[List Orders]
    UC3[Update Order]
  end

  subgraph Entities["Entities (Layer 0)"]
    ENT1[Order]
    ENT2[Customer]
    ENT3[Product]
  end

  WEB --> CTRL
  DB --> GATE
  UI --> PRES
  EXT --> GATE

  CTRL --> UC1
  CTRL --> UC2
  PRES --> UC1
  GATE --> UC3

  UC1 --> ENT1
  UC2 --> ENT1
  UC2 --> ENT2
  UC3 --> ENT1
  UC3 --> ENT3

  style ENT1 fill:#FFD700
  style ENT2 fill:#FFD700
  style ENT3 fill:#FFD700
  style UC1 fill:#2196F3
  style UC2 fill:#2196F3
  style UC3 fill:#2196F3
  style CTRL fill:#FF9800
  style PRES fill:#FF9800
  style GATE fill:#FF9800
  style WEB fill:#9C27B0
  style DB fill:#9C27B0
  style UI fill:#9C27B0
  style EXT fill:#9C27B0
  `,
  layers: [
    {
      name: 'Entities',
      boundaries: ['entities'],
      position: 0
    },
    {
      name: 'Use Cases',
      boundaries: ['use-cases'],
      position: 1
    },
    {
      name: 'Interface Adapters',
      boundaries: ['interface-adapters'],
      position: 2
    },
    {
      name: 'Frameworks & Drivers',
      boundaries: ['frameworks-drivers'],
      position: 3
    }
  ]
}
