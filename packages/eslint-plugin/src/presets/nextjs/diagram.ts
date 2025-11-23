import type { DiagramDefinition } from '@stricture/core'

/**
 * Next.js architecture diagram
 *
 * Visual representation of the Next.js App Router architecture layers
 * and their relationships. Shows the dependency flow between
 * client components, server components, API routes, and utilities.
 */
export const diagram: DiagramDefinition = {
  type: 'mermaid',
  content: `
graph TB
  subgraph Client["Client Side (Browser)"]
    CC[Client Components<br/>'use client']
  end

  subgraph Server["Server Side"]
    SC[Server Components<br/>Default]
    AR[App Routes<br/>pages/layouts]
    API[API Routes<br/>app/api]
    SA[Server Actions<br/>'use server']
    SU[Server Utils<br/>lib/server]
  end

  subgraph Shared["Universal"]
    UTIL[Shared Utils<br/>lib/utils]
  end

  CC -->|can call| SA
  CC -->|can import| CC
  CC -->|can fetch| API
  CC -->|can import| UTIL

  SC -->|can import| CC
  SC -->|can import| SC
  SC -->|can import| SU
  SC -->|can import| SA
  SC -->|can import| UTIL

  AR -->|can import| SC
  AR -->|can import| CC
  AR -->|can import| SU
  AR -->|can import| SA
  AR -->|can import| UTIL

  API -->|can import| SU
  API -->|can import| API
  API -->|can import| UTIL

  SA -->|can import| SU
  SA -->|can import| SA
  SA -->|can import| UTIL

  SU -->|can import| SU
  SU -->|can import| UTIL

  style CC fill:#61DAFB,color:#000
  style SC fill:#4CAF50,color:#fff
  style AR fill:#FF9800,color:#fff
  style API fill:#9C27B0,color:#fff
  style SA fill:#2196F3,color:#fff
  style SU fill:#F44336,color:#fff
  style UTIL fill:#607D8B,color:#fff
  `,
  layers: [
    {
      name: 'Client Components',
      boundaries: ['client-components'],
      position: 0
    },
    {
      name: 'Server Components',
      boundaries: ['server-components'],
      position: 1
    },
    {
      name: 'App Routes',
      boundaries: ['app-routes'],
      position: 1
    },
    {
      name: 'Server Actions',
      boundaries: ['server-actions'],
      position: 2
    },
    {
      name: 'API Routes',
      boundaries: ['api-routes'],
      position: 2
    },
    {
      name: 'Server Utilities',
      boundaries: ['server-utils'],
      position: 3
    },
    {
      name: 'Shared Utilities',
      boundaries: ['shared-utils'],
      position: 3
    }
  ]
}
