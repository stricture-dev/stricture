# @stricture/nextjs - Technical Specification

## Overview

Next.js-specific preset that enforces Server/Client Component boundaries, API route isolation, and App Router conventions for Next.js 13+ applications using the App Router.

## Architecture Principles

### Server-First Philosophy
Next.js defaults to Server Components for optimal performance. This preset enforces:
- Server Components can use server-only code
- Client Components cannot import server-only code
- Explicit boundaries between server and client code

### API Isolation
API routes should contain business logic and data access, not UI:
- API routes cannot import components
- API routes can use server-only utilities
- Components should call APIs, not import them

### Clear Code Organization
Encourage explicit organization:
- `components/server/` - Server Components
- `components/client/` - Client Components
- `lib/server/` - Server-only utilities
- `app/api/` - API routes

## Boundaries

### 1. Server Components
```typescript
{
  name: 'server-components',
  pattern: 'components/server/**',
  mode: 'file',
  tags: ['components', 'server'],
  metadata: {
    description: 'React Server Components - can use server-only code',
    runtime: 'server'
  }
}
```

### 2. Client Components
```typescript
{
  name: 'client-components',
  pattern: 'components/client/**',
  mode: 'file',
  tags: ['components', 'client'],
  metadata: {
    description: 'Client Components with "use client" directive',
    runtime: 'client'
  }
}
```

### 3. App Router Pages/Layouts
```typescript
{
  name: 'app-routes',
  pattern: 'app/**/!(*api)/*.{ts,tsx}',
  mode: 'file',
  tags: ['app', 'routes'],
  metadata: {
    description: 'App Router pages and layouts (Server Components by default)',
    runtime: 'server'
  }
}
```

### 4. API Routes
```typescript
{
  name: 'api-routes',
  pattern: 'app/api/**',
  mode: 'file',
  tags: ['api', 'server'],
  metadata: {
    description: 'API route handlers',
    runtime: 'server'
  }
}
```

### 5. Server-Only Utilities
```typescript
{
  name: 'server-utils',
  pattern: 'lib/server/**',
  mode: 'file',
  tags: ['lib', 'server'],
  metadata: {
    description: 'Server-only utilities (database, auth, etc.)',
    runtime: 'server'
  }
}
```

### 6. Shared Utilities
```typescript
{
  name: 'shared-utils',
  pattern: 'lib/!(server)/**',
  mode: 'file',
  tags: ['lib', 'shared'],
  metadata: {
    description: 'Utilities that work on both server and client',
    runtime: 'universal'
  }
}
```

### 7. Server Actions
```typescript
{
  name: 'server-actions',
  pattern: 'actions/**',
  mode: 'file',
  tags: ['actions', 'server'],
  metadata: {
    description: 'Server Actions with "use server" directive',
    runtime: 'server'
  }
}
```

## Rules

### Critical Restrictions

#### 1. Client Components Cannot Import Server-Only Code
```typescript
{
  id: 'client-no-server-utils',
  name: 'Client Components Cannot Import Server-Only Code',
  description: 'Client Components cannot import server-only utilities',
  severity: 'error',
  from: { tag: 'client', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: false,
  message: 'Client Components cannot import server-only code. Use Server Actions or API routes instead.',
  examples: {
    bad: [
      "import { db } from '@/lib/server/database'  // In client component"
    ],
    good: [
      "import { getUsers } from '@/actions/users'  // Server Action",
      "await fetch('/api/users')  // API route"
    ]
  }
}
```

#### 2. Client Components Cannot Import API Routes
```typescript
{
  id: 'client-no-api',
  name: 'Client Components Cannot Import API Routes',
  description: 'Client Components should call APIs, not import them',
  severity: 'error',
  from: { tag: 'client', mode: 'file' },
  to: { tag: 'api', mode: 'file' },
  allowed: false,
  message: 'Client Components should fetch from API routes, not import them.',
  examples: {
    bad: [
      "import { getUserHandler } from '@/app/api/users/route'"
    ],
    good: [
      "const response = await fetch('/api/users')"
    ]
  }
}
```

#### 3. API Routes Cannot Import Components
```typescript
{
  id: 'api-no-components',
  name: 'API Routes Cannot Import Components',
  description: 'API routes should not import UI components',
  severity: 'error',
  from: { tag: 'api', mode: 'file' },
  to: { tag: 'components', mode: 'file' },
  allowed: false,
  message: 'API routes should contain business logic only, not UI components.',
  examples: {
    bad: [
      "import { UserCard } from '@/components/user-card'"
    ],
    good: [
      "import { getUserService } from '@/lib/server/user-service'"
    ]
  }
}
```

### Allowed Imports

#### 4. Client Components Can Call Server Actions
```typescript
{
  id: 'client-to-server-actions',
  name: 'Client Components Can Import Server Actions',
  description: 'Client Components can call Server Actions',
  severity: 'error',
  from: { tag: 'client', mode: 'file' },
  to: { tag: 'actions', mode: 'file' },
  allowed: true
}
```

#### 5. Server Components Can Import Server-Only Code
```typescript
{
  id: 'server-components-to-server-utils',
  name: 'Server Components Can Import Server Code',
  description: 'Server Components can import server-only utilities',
  severity: 'error',
  from: { tag: 'server', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: true
}
```

#### 6. Server Components Can Import Client Components
```typescript
{
  id: 'server-to-client-components',
  name: 'Server Components Can Import Client Components',
  description: 'Server Components can import and render Client Components',
  severity: 'error',
  from: { tag: 'server', mode: 'file' },
  to: { tag: 'client', mode: 'file' },
  allowed: true
}
```

#### 7. Client Components Can Import Client Components
```typescript
{
  id: 'client-self-imports',
  name: 'Client Components Can Import Each Other',
  description: 'Client Components can import other Client Components',
  severity: 'error',
  from: { tag: 'client', mode: 'file' },
  to: { tag: 'client', mode: 'file' },
  allowed: true
}
```

#### 8. Server Components Can Import Server Components
```typescript
{
  id: 'server-self-imports',
  name: 'Server Components Can Import Each Other',
  description: 'Server Components can import other Server Components',
  severity: 'error',
  from: { tag: 'server', mode: 'file' },
  to: { tag: 'server', mode: 'file' },
  allowed: true
}
```

#### 9. API Routes Can Import Server-Only Code
```typescript
{
  id: 'api-to-server-utils',
  name: 'API Routes Can Import Server Code',
  description: 'API routes can import server-only utilities',
  severity: 'error',
  from: { tag: 'api', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: true
}
```

#### 10. API Routes Can Import API Routes
```typescript
{
  id: 'api-self-imports',
  name: 'API Routes Can Import Each Other',
  description: 'API routes can import shared API utilities',
  severity: 'error',
  from: { tag: 'api', mode: 'file' },
  to: { tag: 'api', mode: 'file' },
  allowed: true
}
```

#### 11. Everyone Can Import Shared Utilities
```typescript
{
  id: 'all-to-shared',
  name: 'All Code Can Import Shared Utilities',
  description: 'Shared utilities are available to all code',
  severity: 'error',
  from: { tag: '*', mode: 'file' },
  to: { tag: 'shared', mode: 'file' },
  allowed: true
}
```

#### 12. App Routes Can Import Server-Only Code
```typescript
{
  id: 'app-routes-to-server-utils',
  name: 'App Routes Can Import Server Code',
  description: 'App Router pages/layouts can import server-only utilities',
  severity: 'error',
  from: { tag: 'routes', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: true
}
```

#### 13. App Routes Can Import Components
```typescript
{
  id: 'app-routes-to-components',
  name: 'App Routes Can Import Components',
  description: 'App Router pages can import both server and client components',
  severity: 'error',
  from: { tag: 'routes', mode: 'file' },
  to: { tag: 'components', mode: 'file' },
  allowed: true
}
```

#### 14. App Routes Can Import Server Actions
```typescript
{
  id: 'app-routes-to-actions',
  name: 'App Routes Can Import Server Actions',
  description: 'App Router pages can use Server Actions',
  severity: 'error',
  from: { tag: 'routes', mode: 'file' },
  to: { tag: 'actions', mode: 'file' },
  allowed: true
}
```

#### 15. Server Actions Can Import Server-Only Code
```typescript
{
  id: 'actions-to-server-utils',
  name: 'Server Actions Can Import Server Code',
  description: 'Server Actions can import server-only utilities',
  severity: 'error',
  from: { tag: 'actions', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: true
}
```

#### 16. Server Actions Can Import Server Actions
```typescript
{
  id: 'actions-self-imports',
  name: 'Server Actions Can Import Each Other',
  description: 'Server Actions can import other Server Actions',
  severity: 'error',
  from: { tag: 'actions', mode: 'file' },
  to: { tag: 'actions', mode: 'file' },
  allowed: true
}
```

#### 17. External Dependencies Allowed
```typescript
{
  id: 'all-to-external',
  name: 'All Code Can Import External Dependencies',
  description: 'External npm packages are allowed',
  severity: 'error',
  from: { tag: '*', mode: 'file' },
  to: { tag: 'external', mode: 'file' },
  allowed: true
}
```

#### 18. App Routes Can Import App Routes
```typescript
{
  id: 'app-routes-self-imports',
  name: 'App Routes Can Import Each Other',
  description: 'App Route files can import other App Route files',
  severity: 'error',
  from: { tag: 'routes', mode: 'file' },
  to: { tag: 'routes', mode: 'file' },
  allowed: true
}
```

#### 19. Server Utils Can Import Server Utils
```typescript
{
  id: 'server-utils-self-imports',
  name: 'Server Utils Can Import Each Other',
  description: 'Server utilities can import other server utilities',
  severity: 'error',
  from: { tag: 'server-utils', mode: 'file' },
  to: { tag: 'server-utils', mode: 'file' },
  allowed: true
}
```

#### 20. Shared Utils Can Import Shared Utils
```typescript
{
  id: 'shared-self-imports',
  name: 'Shared Utils Can Import Each Other',
  description: 'Shared utilities can import other shared utilities',
  severity: 'error',
  from: { tag: 'shared', mode: 'file' },
  to: { tag: 'shared', mode: 'file' },
  allowed: true
}
```

## API Surface

```typescript
export const nextjsPreset: ArchPreset = {
  id: '@stricture/nextjs',
  name: 'Next.js Architecture',
  description: 'Next.js App Router with Server/Client boundaries',
  boundaries: [...],
  rules: [...],
  diagram: {...},
  scaffolding: {...}
}
```

## Dependencies

- **@stricture/core** (workspace:*) - Core validation engine

## Composability

This preset can be combined with other presets:

```json
{
  "preset": "@stricture/nextjs",
  "extends": ["@stricture/hexagonal"],
  "boundaries": [
    // Next.js boundaries + Hexagonal boundaries merged
  ]
}
```

## Implementation Notes

1. **Pattern Matching**: Uses glob patterns to identify file boundaries
2. **Tag-Based Rules**: Rules use tags for flexibility
3. **Deny-by-Default**: Any import not explicitly allowed will be denied
4. **Specificity**: More specific rules take precedence

## Future Enhancements

- **Middleware boundaries** - Detect and enforce edge runtime constraints
- **Route groups** - Enforce boundaries between route groups
- **Parallel routes** - Handle `@slot` directories
- **Intercepting routes** - Handle `(.)` route intercepts
- **Dynamic detection** - Detect 'use client' and 'use server' directives in files
