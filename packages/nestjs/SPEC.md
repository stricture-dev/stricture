# @stricture/nestjs - Technical Specification

## Overview

NestJS-specific preset enforcing module encapsulation, proper DI usage, and separation of controllers, services, DTOs, and entities.

## Responsibilities

- Define NestJS module boundaries
- Enforce controller placement
- Separate DTOs from entities
- Ensure proper DI patterns
- Support combining with hexagonal/layered

## API Surface

```typescript
export const nestjsPreset: ArchPreset = {
  id: '@stricture/nestjs',
  name: 'NestJS Architecture',
  description: 'NestJS modules with proper encapsulation',
  boundaries: [
    { name: 'controllers', pattern: 'src/**/*.controller.ts', mode: 'file' },
    { name: 'services', pattern: 'src/**/*.service.ts', mode: 'file' },
    { name: 'dtos', pattern: 'src/**/dto/**', mode: 'file' },
    { name: 'entities', pattern: 'src/**/entities/**', mode: 'file' }
  ],
  rules: [
    { from: { tag: 'dtos' }, to: { tag: 'entities' }, allowed: false },
    { from: { tag: 'controllers' }, to: { tag: 'entities' }, allowed: false }
  ]
}
```

## Dependencies

- **@stricture/core** (workspace:*)

## Future Enhancements

- Microservices boundaries
- GraphQL resolver boundaries
- Event-driven patterns
