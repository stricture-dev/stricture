# @stricture/clean - Technical Specification

## Overview

Implements Uncle Bob's Clean Architecture with the Dependency Rule: all source code dependencies point inward toward entities.

## Responsibilities

- Define concentric circle boundaries (entities, use-cases, interface-adapters, frameworks-drivers)
- Enforce inward-only dependencies
- Prevent outer layers from leaking into inner layers
- Export preset configuration

## API Surface

```typescript
export const cleanPreset: ArchPreset = {
  id: '@stricture/clean',
  name: 'Clean Architecture',
  description: "Uncle Bob's Clean Architecture with Dependency Rule",
  boundaries,
  rules,
  diagram,
  scaffolding
}
```

### Boundaries (4 layers)

```typescript
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'entities',
    pattern: 'src/entities/**',
    mode: 'file',
    tags: ['entities', 'core'],
    metadata: { description: 'Enterprise business rules', layer: 0 }
  },
  {
    name: 'use-cases',
    pattern: 'src/use-cases/**',
    mode: 'file',
    tags: ['use-cases', 'core'],
    metadata: { description: 'Application business rules', layer: 1 }
  },
  {
    name: 'interface-adapters',
    pattern: 'src/interface-adapters/**',
    mode: 'file',
    tags: ['interface-adapters', 'adapters'],
    metadata: { description: 'Controllers, gateways, presenters', layer: 2 }
  },
  {
    name: 'frameworks-drivers',
    pattern: 'src/frameworks-drivers/**',
    mode: 'file',
    tags: ['frameworks-drivers', 'infrastructure'],
    metadata: { description: 'Frameworks, drivers, external interfaces', layer: 3 }
  }
]
```

### Rules (17 rules)

The preset defines 17 comprehensive rules enforcing the Dependency Rule:

**Entities Layer (Layer 0 - Innermost):**
1. `entities-self-imports` - Entities can import other entities (allowed: true)
2. `entities-isolation` - Entities cannot depend on any outer layer (allowed: false, with message & examples)

**Use Cases Layer (Layer 1):**
3. `use-cases-to-entities` - Use cases can depend on entities (allowed: true)
4. `use-cases-self-imports` - Use cases can import each other (allowed: true)
5. `use-cases-external` - Use cases can use external dependencies (allowed: true)
6. `use-cases-not-interface-adapters` - Use cases cannot depend on interface adapters (allowed: false, with message & examples)
7. `use-cases-not-frameworks` - Use cases cannot depend on frameworks (allowed: false, with message & examples)

**Interface Adapters Layer (Layer 2):**
8. `interface-adapters-to-use-cases` - Adapters can call use cases (allowed: true)
9. `interface-adapters-to-entities` - Adapters can use entities (allowed: true)
10. `interface-adapters-self-imports` - Adapters can import each other (allowed: true)
11. `interface-adapters-external` - Adapters can use external dependencies (allowed: true)
12. `interface-adapters-not-frameworks` - Adapters should not depend on framework layer (allowed: false, with message & examples)

**Frameworks & Drivers Layer (Layer 3 - Outermost):**
13. `frameworks-to-interface-adapters` - Frameworks can use adapters (allowed: true)
14. `frameworks-to-use-cases` - Frameworks can call use cases (allowed: true)
15. `frameworks-to-entities` - Frameworks can use entities (allowed: true)
16. `frameworks-self-imports` - Frameworks can import each other (allowed: true)
17. `frameworks-external` - Frameworks can use external dependencies (allowed: true)

All `allowed: false` rules include:
- Descriptive error messages explaining WHY the import is forbidden
- `examples` field with bad and good code examples
- References to architectural principles (Dependency Rule, inward dependencies)

## Dependencies

- **@stricture/core** (workspace:*)

## Future Enhancements

- CQRS boundaries
- Event sourcing support
- Domain events
