# @stricture/nextjs

Next.js-specific architecture preset for Stricture with App Router and Server/Client Component boundaries.

## Features

- **Server/Client Component Boundaries** - Prevent client-only code in Server Components
- **App Router Support** - Enforce route group boundaries
- **API Route Isolation** - API routes can't import UI components
- **Server-Only Utils** - Protect server-only code from client imports
- **Composable** - Combine with hexagonal, layered, or modular presets

## Installation

```bash
npm install -D @stricture/nextjs @stricture/eslint-plugin
npx stricture init --preset @stricture/nextjs
```

## Directory Structure

```
app/                      # App Router
├── (marketing)/          # Route group
├── (dashboard)/          # Route group
└── api/                  # API routes

components/
├── client/               # 'use client' components
└── server/               # Server Components (default)

lib/
└── server/               # Server-only utilities
```

## Rules

### 1. Server Components Can't Import Client-Only Code

```typescript
// ❌ BAD - Server Component importing client code
// app/page.tsx (Server Component)
import { useClientHook } from '../hooks/use-client-hook'

// ✅ GOOD - Server Component using server code
// app/page.tsx
import { getServerData } from '../lib/server/data'
```

### 2. API Routes Isolated

```typescript
// ❌ BAD - API route importing UI
// app/api/users/route.ts
import { UserCard } from '../../../components/user-card'

// ✅ GOOD - API route logic only
// app/api/users/route.ts
import { UserService } from '../../../lib/server/user-service'
```

### 3. Server-Only Protection

```typescript
// ❌ BAD - Client importing server-only code
// components/client/user-profile.tsx
'use client'
import { db } from '../../lib/server/database'

// ✅ GOOD - Client uses API or Server Actions
'use client'
import { fetchUser } from '../../actions/user'
```

## Combine with Other Presets

```json
{
  "preset": "@stricture/nextjs",
  "extends": ["@stricture/hexagonal"],
  "boundaries": [
    // Next.js boundaries + Hexagonal boundaries
  ]
}
```

## License

MIT
