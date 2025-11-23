import type { DiagramDefinition } from '@stricture/core'

export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `graph TB
    subgraph Auth["Auth Module"]
      AuthAPI[index.ts<br/>Public API]
      AuthImpl[Internal Files]
      AuthImpl -.-> AuthAPI
    end

    subgraph Dashboard["Dashboard Module"]
      DashAPI[index.ts<br/>Public API]
      DashImpl[Internal Files]
      DashImpl -.-> DashAPI
    end

    subgraph Profile["Profile Module"]
      ProfileAPI[index.ts<br/>Public API]
      ProfileImpl[Internal Files]
      ProfileImpl -.-> ProfileAPI
    end

    subgraph Shared["Shared Utilities"]
      SharedUtils[Components<br/>Utils<br/>Types]
    end

    DashImpl --> AuthAPI
    ProfileImpl --> AuthAPI
    ProfileImpl --> DashAPI
    AuthImpl --> SharedUtils
    DashImpl --> SharedUtils
    ProfileImpl --> SharedUtils

    style AuthAPI fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    style DashAPI fill:#e8f5e9,stroke:#43a047,stroke-width:2px
    style ProfileAPI fill:#fff3e0,stroke:#fb8c00,stroke-width:2px
    style SharedUtils fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    style AuthImpl fill:#e1f5ff,stroke:#0288d1,stroke-width:1px,stroke-dasharray: 5 5
    style DashImpl fill:#e8f5e9,stroke:#43a047,stroke-width:1px,stroke-dasharray: 5 5
    style ProfileImpl fill:#fff3e0,stroke:#fb8c00,stroke-width:1px,stroke-dasharray: 5 5
`,
  layers: [
    {
      name: 'Features',
      boundaries: ['module-public', 'module-internal'],
      position: 0
    },
    {
      name: 'Shared',
      boundaries: ['shared'],
      position: 1
    }
  ]
}
