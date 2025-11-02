# @stricture/nextjs - Technical Specification

## Overview

Next.js-specific preset that enforces Server/Client Component boundaries, API route isolation, and App Router conventions.

## Responsibilities

- Define Next.js-specific boundaries (app/, components/client, components/server, lib/server, api/)
- Enforce Server/Client Component separation
- Prevent API routes from importing UI
- Protect server-only utilities
- Support combining with other presets (hexagonal, layered, etc.)

## API Surface

```typescript
export const nextjsPreset: ArchPreset = {
  id: '@stricture/nextjs',
  name: 'Next.js Architecture',
  description: 'Next.js App Router with Server/Client boundaries',
  boundaries: [
    { name: 'server-components', pattern: 'app/**/*.tsx', exclude: ['**/layout.tsx', '**/page.tsx'], mode: 'file' },
    { name: 'client-components', pattern: 'components/client/**', mode: 'file' },
    { name: 'api-routes', pattern: 'app/api/**', mode: 'file' },
    { name: 'server-utils', pattern: 'lib/server/**', mode: 'file' }
  ],
  rules: [
    { from: { tag: 'server-components' }, to: { tag: 'client-components' }, allowed: true },
    { from: { tag: 'client-components' }, to: { tag: 'server-utils' }, allowed: false },
    { from: { tag: 'api-routes' }, to: { tag: 'client-components' }, allowed: false }
  ]
}
```

## Dependencies

- **@stricture/core** (workspace:*)

## Future Enhancements

- Server Actions boundaries
- Middleware boundaries
- Edge Runtime detection
