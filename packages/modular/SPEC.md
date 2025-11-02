# @stricture/modular - Technical Specification

## Overview

Feature-based modular architecture that enforces module encapsulation through public API boundaries.

## Responsibilities

- Define module boundaries (feature modules)
- Enforce public API access (index.ts only)
- Allow shared utility access
- Prevent internal cross-module imports

## API Surface

```typescript
export const modularPreset: ArchPreset = {
  id: '@stricture/modular',
  name: 'Modular Architecture',
  description: 'Feature-based modules with explicit public APIs',
  boundaries: [
    { name: 'module-public', pattern: 'src/features/*/index.ts', mode: 'file' },
    { name: 'module-internal', pattern: 'src/features/**', exclude: ['**/index.ts'], mode: 'file' },
    { name: 'shared', pattern: 'src/shared/**', mode: 'file' }
  ],
  rules: [
    { from: { pattern: 'src/features/**' }, to: { tag: 'module-internal' }, allowed: false },
    { from: { pattern: '**' }, to: { tag: 'shared' }, allowed: true }
  ]
}
```

## Dependencies

- **@stricture/core** (workspace:*)

## Future Enhancements

- Module dependency graph visualization
- Circular dependency detection
- Module coupling metrics
