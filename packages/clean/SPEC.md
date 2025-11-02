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
  boundaries: [
    { name: 'entities', pattern: 'src/entities/**', metadata: { layer: 0 } },
    { name: 'use-cases', pattern: 'src/use-cases/**', metadata: { layer: 1 } },
    { name: 'interface-adapters', pattern: 'src/interface-adapters/**', metadata: { layer: 2 } },
    { name: 'frameworks-drivers', pattern: 'src/frameworks-drivers/**', metadata: { layer: 3 } }
  ],
  rules: [
    // Entities have zero dependencies
    { from: { tag: 'entities' }, to: { pattern: '**' }, allowed: false },
    // Use cases depend on entities only
    { from: { tag: 'use-cases' }, to: { tag: 'entities' }, allowed: true },
    { from: { tag: 'use-cases' }, to: { tag: 'interface-adapters' }, allowed: false },
    { from: { tag: 'use-cases' }, to: { tag: 'frameworks-drivers' }, allowed: false },
    // Interface adapters depend on use-cases and entities
    { from: { tag: 'interface-adapters' }, to: { tag: 'frameworks-drivers' }, allowed: false }
  ]
}
```

## Dependencies

- **@stricture/core** (workspace:*)

## Future Enhancements

- CQRS boundaries
- Event sourcing support
- Domain events
