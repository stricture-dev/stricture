# @stricture/layered - Technical Specification

## Overview

`@stricture/layered` provides a classic 3-tier layered architecture preset that enforces unidirectional dependencies from upper to lower layers, preventing lower layers from depending on upper layers.

## Responsibilities

- Define layered architecture boundaries (presentation, business, data, infrastructure)
- Enforce unidirectional dependency rules (top → bottom only)
- Prevent layer skipping
- Export preset configuration
- Provide scaffolding templates

## API Surface

```typescript
export const layeredPreset: ArchPreset = {
  id: '@stricture/layered',
  name: 'Layered Architecture',
  description: '3-tier architecture with unidirectional layer dependencies',
  boundaries: [
    { name: 'presentation', pattern: 'src/presentation/**', metadata: { layer: 3 } },
    { name: 'business', pattern: 'src/business/**', metadata: { layer: 2 } },
    { name: 'data', pattern: 'src/data/**', metadata: { layer: 1 } },
    { name: 'infrastructure', pattern: 'src/infrastructure/**', metadata: { layer: 0 } }
  ],
  rules: [
    // Prevent upward dependencies
    { from: { tag: 'business' }, to: { tag: 'presentation' }, allowed: false },
    { from: { tag: 'data' }, to: { tag: 'business' }, allowed: false },
    { from: { tag: 'data' }, to: { tag: 'presentation' }, allowed: false },
    { from: { tag: 'infrastructure' }, to: { pattern: 'src/**' }, allowed: false }
  ]
}
```

## Implementation Approach

### Key Files

- `src/index.ts` - Main preset export
- `src/boundaries.ts` - Layer boundary definitions
- `src/rules.ts` - Unidirectional dependency rules
- `src/diagram.ts` - Architecture diagram
- `src/scaffolding.ts` - Directory templates

### Layer Hierarchy

Layer 3 (Top) → Presentation
Layer 2 → Business Logic
Layer 1 → Data Access
Layer 0 (Bottom) → Infrastructure

### Dependency Rules

- presentation → business ✅
- presentation → data ❌ (layer skipping)
- business → data ✅
- business → presentation ❌ (upward)
- data → infrastructure ✅
- data → business ❌ (upward)
- infrastructure → * ❌ (lowest layer)

## Dependencies

- **@stricture/core** (workspace:*)

## Testing Strategy

- Validate layer hierarchy enforcement
- Test no upward dependencies
- Test no layer skipping
- Integration tests with sample projects

## Future Enhancements

- 4-tier architecture variant
- Layer composition (sub-layers)
- Cross-cutting concerns handling
