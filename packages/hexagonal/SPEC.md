# @stricture/hexagonal - Technical Specification

## Overview

`@stricture/hexagonal` provides a complete Hexagonal Architecture (Ports & Adapters) preset for Stricture. It defines boundaries, rules, and scaffolding templates that enforce the separation between domain logic, ports (interfaces), and adapters (implementations).

## Responsibilities

- Define hexagonal architecture boundaries (domain, ports, application, adapters)
- Provide architectural rules that enforce hexagonal principles
- Export preset configuration for use with @stricture/eslint-plugin
- Provide scaffolding templates for generating hexagonal structure
- Include architecture diagram definition
- Provide TypeScript types for hexagonal-specific patterns

## API Surface

### Main Export

```typescript
import { hexagonalPreset } from '@stricture/hexagonal'

export const hexagonalPreset: ArchPreset = {
  id: '@stricture/hexagonal',
  name: 'Hexagonal Architecture',
  description: 'Ports & Adapters pattern with isolated domain logic',
  boundaries: [...],
  rules: [...],
  diagram: {...},
  scaffolding: {...}
}

export default hexagonalPreset
```

### Types

```typescript
// Re-export core types with hexagonal-specific augmentations
export type {
  HexagonalBoundary,
  PortDefinition,
  AdapterDefinition,
  DomainEntity,
  UseCase
}
```

## Implementation Approach

### Key Files

```
packages/hexagonal/
├── src/
│   ├── index.ts              // Main preset export
│   ├── boundaries.ts         // Boundary definitions
│   ├── rules.ts              // Architecture rules
│   ├── diagram.ts            // Mermaid diagram
│   ├── scaffolding.ts        // Directory scaffolding
│   └── types.ts              // TypeScript type augmentations
├── tests/
│   ├── preset.test.ts        // Preset validation
│   └── rules.test.ts         // Rule logic tests
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── SPEC.md
```

### Preset Definition

#### Boundaries

```typescript
// src/boundaries.ts
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'domain',
    pattern: 'src/core/domain/**',
    mode: 'file',
    tags: ['core', 'domain'],
    metadata: {
      description: 'Pure business logic - entities, value objects, domain services',
      layer: 0,  // Innermost layer
      allowedDependencies: []
    }
  },
  {
    name: 'ports',
    pattern: 'src/core/ports/**',
    mode: 'file',
    tags: ['core', 'ports'],
    metadata: {
      description: 'Interface definitions for external interactions',
      layer: 1,
      allowedDependencies: ['domain']
    }
  },
  {
    name: 'application',
    pattern: 'src/core/application/**',
    mode: 'file',
    tags: ['core', 'application'],
    metadata: {
      description: 'Use cases that orchestrate domain and ports',
      layer: 2,
      allowedDependencies: ['domain', 'ports']
    }
  },
  {
    name: 'adapters',
    pattern: 'src/adapters/**',
    mode: 'file',
    tags: ['adapters'],
    metadata: {
      description: 'Infrastructure implementations of ports',
      layer: 3,  // Outermost layer
      allowedDependencies: ['ports', 'application']
    }
  }
]
```

#### Rules

```typescript
// src/rules.ts
export const rules: ArchRule[] = [
  {
    id: 'domain-isolation',
    name: 'Domain Isolation',
    description: 'Domain layer must remain pure with no external dependencies',
    severity: 'error',
    from: { tag: 'domain' },
    to: { pattern: '**' },
    allowed: false,
    message: 'Domain layer must remain pure - no external dependencies allowed. Keep business logic free of infrastructure concerns.',
    examples: {
      bad: [
        "import { Database } from '../../adapters/database'",
        "import axios from 'axios'",
        "import { config } from '../../config'"
      ],
      good: [
        "import { Order } from './order'",
        "import { Money } from './value-objects/money'"
      ]
    }
  },
  {
    id: 'ports-to-domain',
    name: 'Ports Can Reference Domain',
    description: 'Ports define interfaces using domain types',
    severity: 'error',
    from: { tag: 'ports' },
    to: { tag: 'domain' },
    allowed: true,
    message: 'Ports should reference domain types in their interfaces'
  },
  {
    id: 'application-to-core',
    name: 'Application Uses Domain and Ports',
    description: 'Application layer orchestrates domain and ports',
    severity: 'error',
    from: { tag: 'application' },
    to: { tag: 'domain' },
    allowed: true
  },
  {
    id: 'application-to-ports',
    name: 'Application Uses Ports',
    description: 'Application layer depends on port interfaces',
    severity: 'error',
    from: { tag: 'application' },
    to: { tag: 'ports' },
    allowed: true
  },
  {
    id: 'application-not-adapters',
    name: 'Application Isolated from Adapters',
    description: 'Application layer cannot import adapters directly',
    severity: 'error',
    from: { tag: 'application' },
    to: { tag: 'adapters' },
    allowed: false,
    message: 'Application layer should depend on port interfaces, not concrete adapter implementations. This allows flexibility and testability.',
    examples: {
      bad: [
        "import { PostgresRepository } from '../../adapters/database'"
      ],
      good: [
        "import { UserRepository } from '../ports/user-repository'"
      ]
    }
  },
  {
    id: 'adapters-to-ports',
    name: 'Adapters Implement Ports',
    description: 'Adapters implement port interfaces',
    severity: 'error',
    from: { tag: 'adapters' },
    to: { tag: 'ports' },
    allowed: true
  },
  {
    id: 'adapters-to-application',
    name: 'Adapters Can Use Application',
    description: 'Adapters can invoke use cases from application layer',
    severity: 'error',
    from: { tag: 'adapters' },
    to: { tag: 'application' },
    allowed: true
  },
  {
    id: 'adapters-not-domain',
    name: 'Adapters Through Ports Only',
    description: 'Adapters should not import domain directly',
    severity: 'error',
    from: { tag: 'adapters' },
    to: { tag: 'domain' },
    allowed: false,
    message: 'Adapters should depend on ports and application layer, not domain directly. This maintains proper dependency inversion.',
    examples: {
      bad: [
        "import { User } from '../../core/domain/user'"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "import { CreateUserUseCase } from '../../core/application/create-user'"
      ]
    }
  }
]
```

#### Diagram

```typescript
// src/diagram.ts
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
      name: 'Adapters',
      boundaries: ['adapters'],
      position: 3
    }
  ]
}
```

#### Scaffolding

```typescript
// src/scaffolding.ts
export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/core/domain',
      description: 'Domain entities, value objects, and business logic'
    },
    {
      path: 'src/core/domain/entities',
      description: 'Domain entities with identity'
    },
    {
      path: 'src/core/domain/value-objects',
      description: 'Immutable value objects'
    },
    {
      path: 'src/core/ports',
      description: 'Port interfaces for external dependencies'
    },
    {
      path: 'src/core/application',
      description: 'Use cases and application services'
    },
    {
      path: 'src/adapters',
      description: 'Infrastructure implementations'
    },
    {
      path: 'src/adapters/api',
      description: 'HTTP/REST API controllers'
    },
    {
      path: 'src/adapters/database',
      description: 'Database adapters and repositories'
    },
    {
      path: 'src/adapters/messaging',
      description: 'Message queue adapters'
    }
  ],
  files: [
    {
      path: 'src/core/domain/README.md',
      content: `# Domain Layer

Pure business logic with no external dependencies.

## Guidelines

- ✅ Entities and value objects
- ✅ Domain services
- ✅ Business rules and validations
- ❌ No infrastructure code
- ❌ No external dependencies
- ❌ No framework code
`,
      description: 'Domain layer documentation'
    },
    {
      path: 'src/core/ports/README.md',
      content: `# Ports (Interfaces)

Interface definitions for external interactions.

## Guidelines

- ✅ Define interfaces using domain types
- ✅ Keep interfaces focused (ISP)
- ✅ Repository interfaces
- ✅ Service interfaces
- ❌ No implementations here
`,
      description: 'Ports documentation'
    },
    {
      path: 'src/core/application/README.md',
      content: `# Application Layer

Use cases that orchestrate domain and ports.

## Guidelines

- ✅ Use cases (commands/queries)
- ✅ Application services
- ✅ Orchestration logic
- ✅ Depend on ports, not adapters
- ❌ No infrastructure details
`,
      description: 'Application layer documentation'
    },
    {
      path: 'src/adapters/README.md',
      content: `# Adapters (Infrastructure)

Implementations of port interfaces.

## Guidelines

- ✅ Implement port interfaces
- ✅ Framework-specific code here
- ✅ Database, API, messaging code
- ✅ External service integrations
- ❌ No business logic
`,
      description: 'Adapters documentation'
    }
  ]
}
```

## Dependencies

### Runtime Dependencies

- **@stricture/core** (workspace:*) - Core types and utilities

### Dev Dependencies

- **typescript** (^5.3.0)
- **tsup** (^8.0.0)
- **vitest** (^1.2.0)
- **@stricture/typescript-config** (workspace:*)
- **@stricture/eslint-config** (workspace:*)

### Peer Dependencies

None (consumed via @stricture/eslint-plugin)

## Testing Strategy

### Unit Tests

1. **Preset validation**
   - Preset exports all required fields
   - Boundaries are valid
   - Rules are valid
   - Diagram is valid Mermaid

2. **Rule logic**
   - Each rule enforces correct behavior
   - Examples in rules are accurate
   - Rule IDs are unique

3. **Scaffolding**
   - Directory structure is complete
   - Example files are valid
   - Documentation is helpful

### Integration Tests

Test with sample projects:
- Create sample hexagonal project
- Run ESLint with preset
- Verify violations are caught
- Verify valid imports pass

### Test Files

```
tests/
├── preset.test.ts           # Preset structure validation
├── boundaries.test.ts       # Boundary definitions
├── rules.test.ts            # Rule logic
├── diagram.test.ts          # Diagram generation
└── fixtures/
    └── sample-project/      # Sample hexagonal project
```

## Configuration

### Build Configuration (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true
})
```

### TypeScript Configuration

```json
{
  "extends": "@stricture/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Error Handling

The preset itself doesn't handle runtime errors - it's a static configuration. Error handling happens in:
- @stricture/eslint-plugin (enforces rules)
- @stricture/cli (validates preset)

## Performance Considerations

- Preset is loaded once per ESLint run
- No runtime computation
- Minimal memory footprint (< 1KB)
- Fast import and serialization

## Future Enhancements

(Out of scope for v1)

1. **Multiple Hexagons**
   - Support multiple bounded contexts
   - Each with own domain/ports/adapters

2. **Advanced Patterns**
   - CQRS support
   - Event sourcing boundaries
   - Saga patterns

3. **Framework Integration**
   - NestJS hexagonal modules
   - Next.js hexagonal structure
   - Domain-driven design patterns

4. **Type Safety**
   - TypeScript utility types for ports
   - Generic repository patterns
   - Port/adapter type checking
