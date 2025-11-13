# @stricture/modular

Feature-based modular architecture preset for Stricture. Enforces encapsulation of feature modules with explicit public APIs.

## What is Modular Architecture?

Modular architecture organizes code by **features** or **business capabilities** rather than technical layers. Each module is a vertical slice containing everything needed for that feature.

**Key Principles:**
- ✅ **High cohesion** - Everything related to a feature lives together
- ✅ **Low coupling** - Modules communicate through explicit public APIs
- ✅ **Scalable** - Add new features without touching existing ones
- ✅ **Team-friendly** - Different teams can own different modules

## Installation

```bash
npm install -D @stricture/modular @stricture/eslint-plugin
npx stricture init --preset @stricture/modular
```

## Directory Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts          # ✅ Public API - what other modules see
│   │   ├── login-form.tsx    # ❌ Private - internal component
│   │   ├── use-auth.ts       # ❌ Private - internal hook
│   │   └── auth-service.ts   # ❌ Private - internal logic
│   ├── dashboard/
│   │   ├── index.ts          # ✅ Public API
│   │   ├── dashboard.tsx     # ❌ Private
│   │   └── widgets/          # ❌ Private
│   │       ├── stats.tsx
│   │       └── chart.tsx
│   └── profile/
│       ├── index.ts          # ✅ Public API
│       └── ...
└── shared/                   # ✅ Shared utilities (accessible everywhere)
    ├── components/
    │   ├── button.tsx
    │   └── modal.tsx
    ├── utils/
    │   └── format.ts
    └── types/
        └── common.ts
```

## Core Rules

### 1. Import from Public APIs Only

Modules can only import from other modules' `index.ts` files, never from internal files.

```typescript
// ❌ BAD - Importing internal file directly
import { LoginForm } from '../auth/login-form'
import { useAuth } from '../auth/use-auth'

// ✅ GOOD - Importing from public API
import { LoginForm, useAuth } from '../auth'
```

**Why?** This enforces an explicit contract. The module owner can refactor internals without breaking other modules.

### 2. Internal Files are Private

Files inside a module (except `index.ts`) are private implementation details.

```typescript
// src/features/auth/index.ts
// ✅ Public API - carefully chosen exports
export { LoginForm } from './login-form.js'
export { useAuth } from './use-auth.js'
export type { User, AuthError } from './types.js'

// ❌ NOT exported: internal helpers, private components, implementation details
```

### 3. Shared Utilities Available Everywhere

The `src/shared/` directory contains utilities that all modules can import.

```typescript
// ✅ GOOD - Any module can import shared utilities
import { Button } from '../../shared/components/button'
import { formatDate } from '../../shared/utils/format'
import type { ApiResponse } from '../../shared/types/common'
```

### 4. Shared Cannot Import Features

Shared utilities should remain generic. They cannot import from feature modules.

```typescript
// ❌ BAD - Shared importing from features
// src/shared/utils/auth-helper.ts
import { useAuth } from '../../features/auth'  // Violation!

// ✅ GOOD - Keep shared generic, pass dependencies
// src/shared/utils/auth-helper.ts
export function createAuthHelper(checkAuth: () => boolean) {
  // Generic, reusable
}
```

**Why?** Shared utilities should be dependency-free and reusable. Feature-specific code belongs in features.

## Examples

### Auth Module

```typescript
// src/features/auth/types.ts (private)
export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
}

export interface AuthError {
  code: string
  message: string
}

// src/features/auth/auth-service.ts (private)
import type { User, AuthError } from './types.js'

export class AuthService {
  async login(email: string, password: string): Promise<User> {
    // Implementation...
  }

  async logout(): Promise<void> {
    // Implementation...
  }
}

// src/features/auth/login-form.tsx (private)
import { useState } from 'react'
import { AuthService } from './auth-service.js'
import { Button } from '../../shared/components/button.js'

export function LoginForm() {
  // Component implementation...
}

// src/features/auth/index.ts (PUBLIC API)
// Only this file is importable by other modules
export { LoginForm } from './login-form.js'
export { AuthService } from './auth-service.js'
export type { User, AuthError } from './types.js'

// Not exported: internal helpers, private hooks, etc.
```

### Dashboard Module Using Auth

```typescript
// src/features/dashboard/dashboard.tsx
import { useEffect, useState } from 'react'
// ✅ Import from auth's public API
import { AuthService, type User } from '../auth'
// ✅ Import from shared
import { Card } from '../../shared/components/card'

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const authService = new AuthService()

  useEffect(() => {
    // Use auth module's public API
    authService.getCurrentUser().then(setUser)
  }, [])

  return (
    <Card>
      <h1>Welcome, {user?.email}</h1>
    </Card>
  )
}

// src/features/dashboard/index.ts (PUBLIC API)
export { Dashboard } from './dashboard.js'
```

### Shared Components

```typescript
// src/shared/components/button.tsx
import { ButtonHTMLAttributes } from 'react'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="btn" {...props} />
}

// src/shared/utils/format.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

// No index.ts needed - shared files can be imported directly
```

## Common Violations

### ❌ Importing Internal Files

```typescript
// src/features/dashboard/widgets/stats.tsx
import { AuthService } from '../../auth/auth-service'  // BAD!

// Error: Module internal files cannot be imported directly.
// Import from the module's public API instead: '../auth'
```

**Fix**: Import from the public API:
```typescript
import { AuthService } from '../../auth'  // GOOD!
```

### ❌ Shared Importing Features

```typescript
// src/shared/utils/user-helper.ts
import { User } from '../../features/auth/types'  // BAD!

// Error: Shared utilities cannot import from feature modules.
// Keep shared code generic and feature-independent.
```

**Fix**: Pass user as a parameter or define type in shared:
```typescript
// Option 1: Pass as parameter (generic)
export function formatUserName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`
}

// Option 2: Define generic type in shared
// src/shared/types/common.ts
export interface UserLike {
  id: string
  email: string
}
```

### ❌ Exporting Too Much

```typescript
// src/features/auth/index.ts
// BAD - Exporting internal helpers
export { LoginForm } from './login-form.js'
export { AuthService } from './auth-service.js'
export { hashPassword } from './crypto-utils.js'  // Internal helper!
export { validateEmail } from './validators.js'   // Internal helper!

// GOOD - Only export what other modules need
export { LoginForm } from './login-form.js'
export { AuthService } from './auth-service.js'
export type { User, AuthError } from './types.js'
// crypto-utils and validators stay private
```

## When to Use Modular Architecture

**Good for:**
- ✅ Applications with distinct features (dashboard, auth, analytics, settings)
- ✅ Teams working on different features in parallel
- ✅ Projects that grow over time (easy to add new modules)
- ✅ Microservices preparation (extract modules to services later)
- ✅ Clear feature boundaries

**Consider alternatives if:**
- ❌ Small projects with few features (may be over-engineering)
- ❌ Heavy cross-feature dependencies (consider domain-driven design)
- ❌ Need strict technical layering (consider @stricture/layered)
- ❌ Complex domain logic needs isolation (consider @stricture/hexagonal)

## Comparison with Other Architectures

| Architecture | Organization | Best For | Complexity |
|--------------|--------------|----------|------------|
| **Modular** | Vertical feature slices | Product features, scalability | Low-Medium |
| **Layered** | Horizontal technical layers | Traditional apps, CRUD | Low |
| **Hexagonal** | Core + adapters | Complex domain, testability | Medium |
| **Clean** | Concentric circles | Enterprise, maximum isolation | High |

## Migration from Layered Architecture

If you have a layered architecture and want to move to modular:

**Before (Layered):**
```
src/
├── components/      # All UI components
├── services/        # All business logic
├── api/            # All API calls
└── utils/          # All utilities
```

**After (Modular):**
```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── components/    # Auth-specific components
│   │   ├── services/      # Auth-specific services
│   │   └── api/          # Auth-specific API
│   └── dashboard/
│       └── ...
└── shared/              # Truly shared utilities
    ├── components/      # Generic Button, Modal, etc.
    └── utils/          # Generic format, validate, etc.
```

**Benefits:**
- Related code is co-located
- Easier to find code for a feature
- Can extract a module to a separate package
- Clear ownership boundaries

## Advanced Usage

### Custom Configuration

Extend the preset in `.stricture/config.json`:

```json
{
  "preset": "@stricture/modular",
  "boundaries": [
    {
      "name": "config",
      "pattern": "src/config/**",
      "mode": "file",
      "tags": ["config"]
    }
  ],
  "rules": [
    {
      "id": "allow-config-everywhere",
      "from": { "tag": "*" },
      "to": { "tag": "config" },
      "allowed": true
    }
  ]
}
```

### Module Naming Conventions

Modules are auto-detected by folder name under `src/features/`:

```
src/features/user-management/   → module: user-management
src/features/auth/              → module: auth
src/features/api-v2/            → module: api-v2
```

Use kebab-case for consistency.

### Nested Module Organization

Within each module, organize as you prefer:

```
src/features/dashboard/
├── index.ts              # Public API
├── dashboard.tsx         # Main component
├── components/           # Sub-components
│   ├── header.tsx
│   └── sidebar.tsx
├── hooks/               # Custom hooks
│   └── use-dashboard.ts
└── utils/               # Module-specific utilities
    └── calculations.ts
```

The preset doesn't enforce internal structure, only:
1. Public API via `index.ts`
2. Other modules cannot access internals

## Configuration

The preset provides this configuration:

```json
{
  "preset": "@stricture/modular"
}
```

## Benefits

✅ **Scalable** - Add features without modifying existing code
✅ **Clear boundaries** - Explicit APIs prevent coupling
✅ **Parallel development** - Teams work on separate modules
✅ **Easy to refactor** - Move or extract modules independently
✅ **Better code organization** - Related code lives together
✅ **Reduced merge conflicts** - Features are isolated
✅ **Preparation for microservices** - Modules can become services

## License

MIT
