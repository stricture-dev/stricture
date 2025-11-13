# @stricture/layered - Technical Specification

## Overview

Implements classic Layered Architecture (N-tier) where the system is organized into horizontal layers. Each layer can only depend on layers below it or itself, creating a strict unidirectional dependency flow from top to bottom.

## Responsibilities

- Define horizontal layer boundaries (presentation, application, domain, infrastructure)
- Enforce top-to-bottom dependencies only
- Prevent lower layers from depending on higher layers
- Prevent layers from skipping over intermediate layers
- Export preset configuration

## API Surface

```typescript
export const layeredPreset: ArchPreset = {
  id: '@stricture/layered',
  name: 'Layered Architecture',
  description: 'Classic N-tier architecture with strict layer dependencies',
  boundaries,
  rules,
  diagram,
  scaffolding
}
```

## Architecture Principles

### Layer Hierarchy (Top to Bottom)

```
┌─────────────────────────────────┐
│  Presentation Layer (Layer 0)   │  UI, Controllers, Views
├─────────────────────────────────┤
│  Application Layer (Layer 1)    │  Use Cases, Orchestration
├─────────────────────────────────┤
│  Domain Layer (Layer 2)         │  Business Logic, Entities
├─────────────────────────────────┤
│  Infrastructure Layer (Layer 3) │  Data Access, External Systems
└─────────────────────────────────┘
```

### Dependency Rules

1. **Each layer can import from itself** - Files within a layer can import each other
2. **Each layer can import from layers below** - Presentation → Application → Domain → Infrastructure
3. **No upward dependencies** - Infrastructure CANNOT import from Domain, Domain CANNOT import from Application, etc.
4. **No layer skipping** - Presentation should go through Application to reach Domain (enforced by good design, but allowed for flexibility)
5. **External dependencies controlled** - Only specific layers can import external packages

### Layer Descriptions

**Presentation Layer (Layer 0 - Top)**
- Pattern: `src/presentation/**`
- Tags: `presentation`, `ui`
- Responsibilities: User interface, HTTP controllers, GraphQL resolvers, CLI commands, views
- Can depend on: application, domain, infrastructure (for DI), external (UI libraries)
- Cannot depend on: none (topmost layer)

**Application Layer (Layer 1)**
- Pattern: `src/application/**`
- Tags: `application`, `services`
- Responsibilities: Use cases, application services, orchestration, workflows
- Can depend on: domain, infrastructure (for ports/interfaces), external (utilities)
- Cannot depend on: presentation

**Domain Layer (Layer 2)**
- Pattern: `src/domain/**`
- Tags: `domain`, `core`
- Responsibilities: Business logic, domain entities, value objects, domain services
- Can depend on: infrastructure (for interfaces/ports only), external (minimal - validation libraries)
- Cannot depend on: presentation, application

**Infrastructure Layer (Layer 3 - Bottom)**
- Pattern: `src/infrastructure/**`
- Tags: `infrastructure`, `data`
- Responsibilities: Database access, external APIs, file system, messaging, persistence implementations
- Can depend on: domain (for entities/types), external (database drivers, HTTP clients)
- Cannot depend on: presentation, application

## Boundaries (4 layers)

```typescript
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'presentation',
    pattern: 'src/presentation/**',
    mode: 'file',
    tags: ['presentation', 'ui'],
    metadata: {
      description: 'User interface, controllers, views, CLI',
      layer: 0
    }
  },
  {
    name: 'application',
    pattern: 'src/application/**',
    mode: 'file',
    tags: ['application', 'services'],
    metadata: {
      description: 'Use cases, application services, orchestration',
      layer: 1
    }
  },
  {
    name: 'domain',
    pattern: 'src/domain/**',
    mode: 'file',
    tags: ['domain', 'core'],
    metadata: {
      description: 'Business logic, entities, domain services',
      layer: 2
    }
  },
  {
    name: 'infrastructure',
    pattern: 'src/infrastructure/**',
    mode: 'file',
    tags: ['infrastructure', 'data'],
    metadata: {
      description: 'Data access, external systems, persistence',
      layer: 3
    }
  }
]
```

## Rules (21 rules)

The preset defines 21 comprehensive rules enforcing layered dependencies:

### Presentation Layer (Layer 0 - Top)

1. **`presentation-self-imports`** - Presentation files can import each other (allowed: true)
2. **`presentation-to-application`** - Presentation can use application layer (allowed: true)
3. **`presentation-to-domain`** - Presentation can use domain types (allowed: true)
4. **`presentation-to-infrastructure`** - Presentation can use infrastructure for DI (allowed: true)
5. **`presentation-external`** - Presentation can use external UI libraries (allowed: true)

### Application Layer (Layer 1)

6. **`application-self-imports`** - Application files can import each other (allowed: true)
7. **`application-to-domain`** - Application can use domain layer (allowed: true)
8. **`application-to-infrastructure`** - Application can use infrastructure interfaces (allowed: true)
9. **`application-external`** - Application can use external utilities (allowed: true)
10. **`application-not-presentation`** - Application cannot depend on presentation (allowed: false, with message & examples)

### Domain Layer (Layer 2)

11. **`domain-self-imports`** - Domain files can import each other (allowed: true)
12. **`domain-to-infrastructure`** - Domain can define infrastructure interfaces/ports (allowed: true)
13. **`domain-external`** - Domain can use minimal external dependencies (allowed: true)
14. **`domain-not-presentation`** - Domain cannot depend on presentation (allowed: false, with message & examples)
15. **`domain-not-application`** - Domain cannot depend on application (allowed: false, with message & examples)

### Infrastructure Layer (Layer 3 - Bottom)

16. **`infrastructure-self-imports`** - Infrastructure files can import each other (allowed: true)
17. **`infrastructure-to-domain`** - Infrastructure can import domain entities (allowed: true)
18. **`infrastructure-external`** - Infrastructure can use external data libraries (allowed: true)
19. **`infrastructure-not-presentation`** - Infrastructure cannot depend on presentation (allowed: false, with message & examples)
20. **`infrastructure-not-application`** - Infrastructure cannot depend on application (allowed: false, with message & examples)

### Type Definitions

21. **`types-external-allowed`** - All layers can use TypeScript type definitions (allowed: true)

All `allowed: false` rules include:
- Descriptive error messages explaining WHY the import is forbidden
- `examples` field with bad and good code examples
- References to layered architecture principles

## Implementation Approach

### Rule Specificity

Rules are ordered by specificity to ensure correct matching:
1. External type definitions (highest specificity)
2. Layer-specific dependencies (medium specificity)
3. Layer isolation rules (lower specificity, broader scope)

### Deny-by-Default

The preset relies on Stricture's deny-by-default behavior:
- Any import not explicitly allowed by a rule is denied
- Comprehensive allowed rules cover all legitimate imports
- Users receive helpful error messages when rules are violated

### Message Quality

Each violation provides:
- Clear explanation of which layer is trying to import what
- Architectural reason why it's forbidden
- Suggested alternatives or patterns to use instead
- Code examples showing correct approach

## Dependencies

- **@stricture/core** (workspace:*)

## Design Decisions

### Why Infrastructure Can Import Domain

In practical layered architecture, the infrastructure layer (data access) needs to work with domain entities for repository implementations. While infrastructure is the bottom layer, it's allowed to import domain entities and value objects. This is a pragmatic choice that simplifies repository implementations without requiring DTOs for every data operation.

### Layer Skipping

While strict layered architecture discourages skipping layers (e.g., Presentation should not directly call Domain), we allow it for flexibility. This gives teams the choice to be strict or pragmatic based on their needs.

### External Dependencies

Each layer has different external dependency needs:
- **Presentation**: UI frameworks, routing libraries
- **Application**: Validation libraries, date utilities
- **Domain**: Minimal - only pure logic libraries
- **Infrastructure**: Database drivers, HTTP clients, file system

## Future Enhancements

- Strict mode: Prevent layer skipping
- Port/Interface tracking: Distinguish between domain logic and domain interfaces
- Cross-cutting concerns: Logging, monitoring (allowed in all layers)
- Module boundaries: Sub-layers within each layer
