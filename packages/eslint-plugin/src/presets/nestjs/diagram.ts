import type { DiagramDefinition } from '@stricture/core'

/**
 * NestJS architecture diagram
 *
 * Visual representation of NestJS layered architecture showing:
 * - Presentation layer (Controllers, DTOs)
 * - Business logic layer (Services)
 * - Data layer (Repositories, Entities)
 * - Cross-cutting concerns (Guards, Interceptors, Pipes, Common)
 */
export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#b3d9ff','primaryBorderColor':'#1976d2','secondaryColor':'#b3ffcc','secondaryBorderColor':'#2e7d32','tertiaryColor':'#ffffb3','tertiaryBorderColor':'#f57c00'}}}%%
graph TB
    subgraph presentation["Presentation Layer"]
        Controllers["Controllers<br/><i>*.controller.ts</i>"]
        DTOs["DTOs<br/><i>dto/**</i>"]
    end

    subgraph business["Business Logic Layer"]
        Services["Services<br/><i>*.service.ts</i>"]
    end

    subgraph data["Data Layer"]
        Repositories["Repositories<br/><i>*.repository.ts</i>"]
        Entities["Entities<br/><i>entities/**</i>"]
    end

    subgraph crosscutting["Cross-Cutting Concerns"]
        Guards["Guards"]
        Interceptors["Interceptors"]
        Pipes["Pipes"]
        Common["Common"]
    end

    Controllers --> Services
    Controllers --> DTOs
    Services --> Repositories
    Services --> Entities
    Services --> DTOs
    Repositories --> Entities

    Controllers -.-> Guards
    Controllers -.-> Interceptors
    Controllers -.-> Pipes
    Controllers -.-> Common
    Services -.-> Common

    style presentation fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style business fill:#f1f8e9,stroke:#2e7d32,stroke-width:2px
    style data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style crosscutting fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px

    linkStyle 0,1,2,3,4,5 stroke:#22c55e,stroke-width:2px
    linkStyle 6,7,8,9,10 stroke:#9e9e9e,stroke-width:1px,stroke-dasharray: 5 5`,
  layers: [
    {
      name: 'Presentation',
      boundaries: ['controllers', 'dtos'],
      position: 0
    },
    {
      name: 'Business Logic',
      boundaries: ['services'],
      position: 1
    },
    {
      name: 'Data',
      boundaries: ['repositories', 'entities'],
      position: 2
    },
    {
      name: 'Cross-Cutting',
      boundaries: ['guards', 'interceptors', 'pipes', 'decorators', 'common', 'config'],
      position: -1
    }
  ]
}
