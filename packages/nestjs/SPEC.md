# @stricture/nestjs - Technical Specification

## Overview

`@stricture/nestjs` provides a comprehensive NestJS architecture preset for Stricture. It enforces NestJS best practices including module encapsulation, proper separation of concerns between controllers/services/DTOs/entities, and correct dependency injection patterns.

## Responsibilities

- Define NestJS-specific boundaries (controllers, services, DTOs, entities, guards, etc.)
- Enforce module encapsulation and independence
- Prevent direct entity exposure in APIs (enforce DTO usage)
- Ensure proper dependency flow (controllers → services → repositories)
- Support NestJS-specific patterns (guards, interceptors, pipes, decorators)
- Provide scaffolding templates for NestJS project structure
- Include architecture diagram showing NestJS layering

## API Surface

### Main Export

```typescript
import { nestjsPreset } from '@stricture/nestjs'

export const nestjsPreset: ArchPreset = {
  id: '@stricture/nestjs',
  name: 'NestJS Architecture',
  description: 'NestJS best practices with module encapsulation and proper layering',
  boundaries: [...],
  rules: [...],
  diagram: {...},
  scaffolding: {...}
}

export default nestjsPreset
```

### Types

```typescript
// NestJS-specific type augmentations
export type {
  NestJSBoundary,
  ModuleDefinition,
  ControllerDefinition,
  ServiceDefinition,
  DTODefinition,
  EntityDefinition
}
```

## Implementation Approach

### Key Files

```
packages/nestjs/
├── src/
│   ├── index.ts              // Main preset export
│   ├── boundaries.ts         // Boundary definitions
│   ├── rules.ts              // Architecture rules
│   ├── diagram.ts            // Mermaid diagram
│   ├── scaffolding.ts        // Directory scaffolding
│   └── types.ts              // TypeScript type augmentations
├── tests/
│   ├── preset.test.ts        // Preset validation
│   ├── boundaries.test.ts    // Boundary tests
│   └── rules.test.ts         // Rule logic tests
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── SPEC.md
```

### Preset Definition

#### Boundaries

The preset defines the following boundaries representing NestJS architectural layers:

```typescript
// src/boundaries.ts
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'controllers',
    pattern: 'src/**/*.controller.ts',
    mode: 'file',
    tags: ['nestjs', 'controllers', 'presentation'],
    metadata: {
      description: 'HTTP controllers handling requests and responses',
      layer: 0  // Outermost layer (entry points)
    }
  },
  {
    name: 'services',
    pattern: 'src/**/*.service.ts',
    mode: 'file',
    tags: ['nestjs', 'services', 'business-logic'],
    metadata: {
      description: 'Business logic providers injected via DI',
      layer: 1
    }
  },
  {
    name: 'dtos',
    pattern: 'src/**/dto/**',
    mode: 'file',
    tags: ['nestjs', 'dtos', 'contracts'],
    metadata: {
      description: 'Data Transfer Objects for API contracts',
      layer: 0  // Part of presentation layer
    }
  },
  {
    name: 'entities',
    pattern: 'src/**/entities/**',
    mode: 'file',
    tags: ['nestjs', 'entities', 'data'],
    metadata: {
      description: 'Database entities and domain models',
      layer: 2  // Innermost layer
    }
  },
  {
    name: 'repositories',
    pattern: 'src/**/*.repository.ts',
    mode: 'file',
    tags: ['nestjs', 'repositories', 'data'],
    metadata: {
      description: 'Data access layer (TypeORM repositories, Prisma clients, etc.)',
      layer: 2
    }
  },
  {
    name: 'guards',
    pattern: 'src/**/guards/**',
    mode: 'file',
    tags: ['nestjs', 'guards', 'common'],
    metadata: {
      description: 'Authorization and authentication guards',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'interceptors',
    pattern: 'src/**/interceptors/**',
    mode: 'file',
    tags: ['nestjs', 'interceptors', 'common'],
    metadata: {
      description: 'Request/response transformation interceptors',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'pipes',
    pattern: 'src/**/pipes/**',
    mode: 'file',
    tags: ['nestjs', 'pipes', 'common'],
    metadata: {
      description: 'Validation and transformation pipes',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'decorators',
    pattern: 'src/**/decorators/**',
    mode: 'file',
    tags: ['nestjs', 'decorators', 'common'],
    metadata: {
      description: 'Custom decorators for metadata and behavior',
      layer: -1  // Cross-cutting concern
    }
  },
  {
    name: 'common',
    pattern: 'src/common/**',
    mode: 'file',
    tags: ['nestjs', 'common', 'shared'],
    metadata: {
      description: 'Shared utilities, interfaces, and types',
      layer: -1  // Available everywhere
    }
  },
  {
    name: 'config',
    pattern: 'src/config/**',
    mode: 'file',
    tags: ['nestjs', 'config', 'common'],
    metadata: {
      description: 'Configuration modules and services',
      layer: -1  // Cross-cutting concern
    }
  }
]
```

#### Rules

Key architectural rules for NestJS:

```typescript
// src/rules.ts
export const rules: ArchRule[] = [
  // DTO Isolation - DTOs should NOT import entities
  {
    id: 'dtos-not-entities',
    name: 'DTOs Cannot Import Entities',
    description: 'DTOs define API contracts and should not depend on database entities',
    severity: 'error',
    from: { tag: 'dtos', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: false,
    message: 'DTOs should not import entities. DTOs define API contracts (input/output), while entities are internal database models. Keep them separate to allow independent evolution.',
    examples: {
      bad: [
        "import { User } from '../entities/user.entity'  // In DTO file"
      ],
      good: [
        "// Define DTO independently:",
        "export class CreateUserDto {",
        "  email: string;",
        "  name: string;",
        "}"
      ]
    }
  },

  // Controller Isolation - Controllers should NOT import entities
  {
    id: 'controllers-not-entities',
    name: 'Controllers Cannot Import Entities',
    description: 'Controllers should use DTOs for API contracts, not entities',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import entities directly. Use DTOs for API input/output to avoid exposing database structure.',
    examples: {
      bad: [
        "import { User } from './entities/user.entity'  // In controller",
        "@Get()",
        "findAll(): Promise<User[]> { ... }  // Exposes entity"
      ],
      good: [
        "import { UserDto } from './dto/user.dto'",
        "@Get()",
        "findAll(): Promise<UserDto[]> { ... }  // Uses DTO"
      ]
    }
  },

  // Controllers call Services
  {
    id: 'controllers-to-services',
    name: 'Controllers Call Services',
    description: 'Controllers should delegate business logic to services',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'services', mode: 'file' },
    allowed: true
  },

  // Controllers use DTOs
  {
    id: 'controllers-to-dtos',
    name: 'Controllers Use DTOs',
    description: 'Controllers use DTOs for request/response',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: true
  },

  // Controllers should not call other controllers
  {
    id: 'controllers-independent',
    name: 'Controllers Are Independent',
    description: 'Controllers should not import each other',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'controllers', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import each other. If you need to share logic, move it to a service and inject it into both controllers.',
    examples: {
      bad: [
        "import { UsersController } from './users.controller'  // In posts.controller"
      ],
      good: [
        "// Create a shared service instead:",
        "@Injectable()",
        "export class SharedService { ... }",
        "// Inject into both controllers"
      ]
    }
  },

  // Controllers should not call repositories directly
  {
    id: 'controllers-not-repositories',
    name: 'Controllers Cannot Import Repositories',
    description: 'Controllers should call services, not repositories directly',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'repositories', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import repositories directly. Use services as an intermediary to keep business logic separate from HTTP handling.',
    examples: {
      bad: [
        "@Controller('users')",
        "export class UsersController {",
        "  constructor(private usersRepo: UsersRepository) { }  // Bad!"
      ],
      good: [
        "@Controller('users')",
        "export class UsersController {",
        "  constructor(private usersService: UsersService) { }  // Good!"
      ]
    }
  },

  // Services can use entities
  {
    id: 'services-to-entities',
    name: 'Services Can Import Entities',
    description: 'Services work with entities for business logic',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },

  // Services can use repositories
  {
    id: 'services-to-repositories',
    name: 'Services Use Repositories',
    description: 'Services use repositories for data access',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'repositories', mode: 'file' },
    allowed: true
  },

  // Services can use DTOs (for mapping)
  {
    id: 'services-to-dtos',
    name: 'Services Can Use DTOs',
    description: 'Services can map between entities and DTOs',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: true
  },

  // Services can call other services
  {
    id: 'services-to-services',
    name: 'Services Can Import Other Services',
    description: 'Services can depend on other services via DI',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'services', mode: 'file' },
    allowed: true
  },

  // Repositories can use entities
  {
    id: 'repositories-to-entities',
    name: 'Repositories Work With Entities',
    description: 'Repositories persist and retrieve entities',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },

  // Repositories should not import DTOs
  {
    id: 'repositories-not-dtos',
    name: 'Repositories Cannot Import DTOs',
    description: 'Repositories work with entities, not DTOs',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: false,
    message: 'Repositories should work with entities, not DTOs. DTOs are for API contracts, entities are for data persistence.',
    examples: {
      bad: [
        "import { CreateUserDto } from '../dto/create-user.dto'  // In repository"
      ],
      good: [
        "import { User } from '../entities/user.entity'",
        "// Repository methods use entities"
      ]
    }
  },

  // Repositories should not import controllers
  {
    id: 'repositories-not-controllers',
    name: 'Repositories Cannot Import Controllers',
    description: 'Repositories are data layer, controllers are presentation',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'controllers', mode: 'file' },
    allowed: false,
    message: 'Repositories should not import controllers. This violates dependency flow. Controllers call services, services call repositories.',
  },

  // Common can be used everywhere
  {
    id: 'any-to-common',
    name: 'Common Is Available Everywhere',
    description: 'Any layer can import from common utilities',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { tag: 'common', mode: 'file' },
    allowed: true
  },

  // Guards can be used everywhere
  {
    id: 'any-to-guards',
    name: 'Guards Available Everywhere',
    description: 'Guards can be used in controllers, services, etc.',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'guards', mode: 'file' },
    allowed: true
  },

  // Interceptors can be used everywhere
  {
    id: 'any-to-interceptors',
    name: 'Interceptors Available Everywhere',
    description: 'Interceptors can be used throughout the application',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'interceptors', mode: 'file' },
    allowed: true
  },

  // Pipes can be used everywhere
  {
    id: 'any-to-pipes',
    name: 'Pipes Available Everywhere',
    description: 'Pipes can be used for validation everywhere',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'pipes', mode: 'file' },
    allowed: true
  },

  // Decorators can be used everywhere
  {
    id: 'any-to-decorators',
    name: 'Decorators Available Everywhere',
    description: 'Custom decorators can be used throughout the application',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'decorators', mode: 'file' },
    allowed: true
  },

  // Config can be used everywhere
  {
    id: 'any-to-config',
    name: 'Config Available Everywhere',
    description: 'Configuration can be injected anywhere',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'config', mode: 'file' },
    allowed: true
  },

  // External dependencies allowed everywhere (NestJS is pragmatic)
  {
    id: 'any-to-external',
    name: 'External Dependencies Allowed',
    description: 'NestJS code can use external libraries',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  }
]
```

## Architecture Principles

### 1. Module Encapsulation

Each feature module should be self-contained with its own:
- Controller(s) - HTTP layer
- Service(s) - Business logic
- Repository(ies) - Data access
- DTOs - API contracts
- Entities - Data models
- Module definition - DI configuration

### 2. Layered Dependency Flow

```
Controllers (HTTP)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Entities (Models)
```

### 3. DTO vs Entity Separation

- **DTOs**: API contracts (input/output), validation, transformation
- **Entities**: Database models, internal structure, relationships
- **Why separate**: API can evolve independently from database schema

### 4. Cross-Cutting Concerns

Guards, interceptors, pipes, and decorators are shared across all layers and can be used anywhere.

### 5. Common/Shared Code

Utilities, interfaces, constants, and helpers live in `common/` and are available to all modules.

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
   - Rule IDs are unique

2. **Boundary tests**
   - Controllers pattern matches *.controller.ts files
   - Services pattern matches *.service.ts files
   - DTOs pattern matches dto/ folders
   - Entities pattern matches entities/ folders
   - All boundaries have correct tags

3. **Rule logic tests**
   - DTOs cannot import entities (enforced)
   - Controllers cannot import entities (enforced)
   - Controllers must use services (enforced)
   - Controllers cannot import repositories (enforced)
   - Services can import entities (allowed)
   - Repositories work with entities (allowed)
   - Common is accessible everywhere (allowed)

### Integration Tests

Test with sample NestJS project:
- Create sample modules (users, posts)
- Include both valid and invalid imports
- Run ESLint with preset
- Verify violations are caught
- Verify valid imports pass

### Test Files

```
tests/
├── preset.test.ts           # Preset structure validation
├── boundaries.test.ts       # Boundary pattern matching
├── rules.test.ts            # Rule enforcement
└── fixtures/
    └── sample-nestjs/       # Sample NestJS project
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
- Minimal memory footprint
- Fast import and serialization
- Pattern matching optimized by core

## Composability

The NestJS preset can be composed with other presets:

### With Hexagonal Architecture

```json
{
  "presets": ["@stricture/nestjs", "@stricture/hexagonal"],
  "boundaries": [
    // NestJS boundaries + Hexagonal boundaries
  ],
  "rules": [
    // Combined rules from both
  ]
}
```

### With Layered Architecture

```json
{
  "presets": ["@stricture/nestjs", "@stricture/layered"]
}
```

## Future Enhancements

(Out of scope for v1)

1. **Microservices Support**
   - Message pattern boundaries
   - Event boundaries
   - Microservice module independence

2. **GraphQL Support**
   - Resolver boundaries
   - GraphQL DTO boundaries
   - Schema-first vs code-first

3. **CQRS Support**
   - Command boundaries
   - Query boundaries
   - Event sourcing patterns

4. **Advanced Patterns**
   - Saga patterns
   - Event-driven architecture
   - Domain-driven design with NestJS

5. **Testing Boundaries**
   - E2E test isolation
   - Unit test co-location
   - Mock/stub boundaries
