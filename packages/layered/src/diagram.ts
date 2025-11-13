import type { DiagramDefinition } from '@stricture/core'

export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `graph TB
    P[Presentation Layer<br/>Controllers, Views, UI]
    A[Application Layer<br/>Use Cases, Services]
    D[Domain Layer<br/>Entities, Business Logic]
    I[Infrastructure Layer<br/>Data Access, External APIs]
    
    P --> A
    P --> D
    P --> I
    A --> D
    A --> I
    D --> I
    
    style P fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    style A fill:#e8f5e9,stroke:#43a047,stroke-width:2px
    style D fill:#fff3e0,stroke:#fb8c00,stroke-width:2px
    style I fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    
    classDef layerStyle fill:#f9f9f9,stroke:#333,stroke-width:1px
`,
  layers: [
    {
      name: 'Presentation',
      boundaries: ['presentation'],
      position: 0
    },
    {
      name: 'Application',
      boundaries: ['application'],
      position: 1
    },
    {
      name: 'Domain',
      boundaries: ['domain'],
      position: 2
    },
    {
      name: 'Infrastructure',
      boundaries: ['infrastructure'],
      position: 3
    }
  ]
}
