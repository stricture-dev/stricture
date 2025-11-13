import type { ScaffoldingTemplate } from '@stricture/core'

export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/features',
      description: 'Feature modules - vertical slices of functionality'
    },
    {
      path: 'src/features/auth',
      description: 'Authentication and authorization feature'
    },
    {
      path: 'src/features/auth/components',
      description: 'Auth-specific UI components'
    },
    {
      path: 'src/features/auth/services',
      description: 'Auth-specific business logic'
    },
    {
      path: 'src/features/dashboard',
      description: 'Dashboard feature'
    },
    {
      path: 'src/features/dashboard/components',
      description: 'Dashboard-specific UI components'
    },
    {
      path: 'src/features/profile',
      description: 'User profile feature'
    },
    {
      path: 'src/shared',
      description: 'Shared utilities accessible by all modules'
    },
    {
      path: 'src/shared/components',
      description: 'Reusable UI components'
    },
    {
      path: 'src/shared/utils',
      description: 'Utility functions'
    },
    {
      path: 'src/shared/types',
      description: 'Common TypeScript types'
    }
  ],
  files: [
    {
      path: 'src/features/README.md',
      description: 'Feature modules documentation',
      content: `# Feature Modules

Feature modules are **vertical slices** of functionality. Each module contains everything needed for that feature.

## Module Structure

Each module MUST have:
- \`index.ts\` - **Public API** (what other modules can import)
- Internal implementation files (private to the module)

\`\`\`
src/features/auth/
├── index.ts           # ✅ Public API - exports only
├── login.tsx          # ❌ Private implementation
├── register.tsx       # ❌ Private implementation
└── types.ts           # ❌ Private types
\`\`\`

## Public API Pattern

The \`index.ts\` file defines what your module exports:

\`\`\`typescript
// src/features/auth/index.ts
// Export only what other modules need to use
export { LoginForm } from './login.js'
export { RegisterForm } from './register.js'
export type { User, AuthError } from './types.js'

// Internal helpers, utilities, and components stay private
\`\`\`

## Cross-Module Dependencies

Modules can only import from other modules' public APIs:

\`\`\`typescript
// ✅ GOOD - Import from public API
import { LoginForm } from '../auth'

// ❌ BAD - Import from internal file
import { LoginForm } from '../auth/login'
\`\`\`

## Module Organization

Within each module, organize as you prefer:

\`\`\`
src/features/dashboard/
├── index.ts              # Public API
├── dashboard.tsx         # Main component
├── components/           # Sub-components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── widgets/
│       ├── stats.tsx
│       └── chart.tsx
├── hooks/               # Custom hooks
│   └── use-dashboard.ts
├── services/            # Business logic
│   └── dashboard-service.ts
└── types.ts             # Type definitions
\`\`\`

## Guidelines

- ✅ Keep modules focused on a single feature
- ✅ Export minimal public API (principle of least exposure)
- ✅ Use shared utilities for common code
- ✅ Make modules independently testable
- ❌ Don't import internal files from other modules
- ❌ Don't create circular dependencies between modules
`
    },
    {
      path: 'src/features/auth/index.ts',
      description: 'Auth module public API',
      content: `// Auth Module Public API
// Export only what other modules need to use

// Example exports (replace with your actual implementation)
// export { LoginForm } from './components/login-form.js'
// export { RegisterForm } from './components/register-form.js'
// export { useAuth } from './hooks/use-auth.js'
// export type { User, AuthError } from './types.js'
`
    },
    {
      path: 'src/features/dashboard/index.ts',
      description: 'Dashboard module public API',
      content: `// Dashboard Module Public API
// Export only what other modules need to use

// Example exports (replace with your actual implementation)
// export { Dashboard } from './dashboard.js'
// export { DashboardStats } from './components/stats.js'
// export type { DashboardData } from './types.js'
`
    },
    {
      path: 'src/features/profile/index.ts',
      description: 'Profile module public API',
      content: `// Profile Module Public API
// Export only what other modules need to use

// Example exports (replace with your actual implementation)
// export { ProfilePage } from './profile-page.js'
// export { ProfileSettings } from './components/settings.js'
// export type { Profile } from './types.js'
`
    },
    {
      path: 'src/shared/README.md',
      description: 'Shared utilities documentation',
      content: `# Shared Utilities

The \`src/shared/\` directory contains utilities that **all modules** can use.

## What Goes Here

- ✅ **Generic UI components** - Button, Modal, Input, Card
- ✅ **Utility functions** - formatDate, validateEmail, debounce
- ✅ **Common types** - ApiResponse, PaginationParams, ErrorCode
- ✅ **Hooks** - useLocalStorage, useFetch, useDebounce
- ✅ **Constants** - API_BASE_URL, MAX_FILE_SIZE

## What Does NOT Go Here

- ❌ **Feature-specific code** - Belongs in feature modules
- ❌ **Business logic** - Belongs in feature modules
- ❌ **Feature types** - Define in the feature module

## Important Rule

**Shared utilities CANNOT import from feature modules.**

This keeps shared code generic and prevents circular dependencies.

\`\`\`typescript
// ❌ BAD - Shared importing from feature
// src/shared/utils/format-user.ts
import { User } from '../../features/auth/types'  // Violation!

// ✅ GOOD - Keep shared generic
// src/shared/utils/format-user.ts
export function formatUserName(user: { firstName: string; lastName: string }) {
  return \`\${user.firstName} \${user.lastName}\`
}
\`\`\`

## Organization

\`\`\`
src/shared/
├── components/      # Reusable UI components
│   ├── button.tsx
│   ├── modal.tsx
│   └── input.tsx
├── hooks/          # Custom React hooks
│   ├── use-local-storage.ts
│   └── use-fetch.ts
├── utils/          # Utility functions
│   ├── format.ts
│   ├── validate.ts
│   └── date.ts
├── types/          # Common TypeScript types
│   └── common.ts
└── constants/      # Application constants
    └── config.ts
\`\`\`

## Examples

\`\`\`typescript
// components/button.tsx
import { ButtonHTMLAttributes } from 'react'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="btn" {...props} />
}

// utils/format.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// types/common.ts
export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}
\`\`\`

## Usage in Modules

Feature modules can freely import shared utilities:

\`\`\`typescript
// src/features/dashboard/dashboard.tsx
import { Button } from '../../shared/components/button'
import { formatDate } from '../../shared/utils/format'
import type { ApiResponse } from '../../shared/types/common'

export function Dashboard() {
  // Use shared utilities
  const formattedDate = formatDate(new Date())
  return <Button>Click me</Button>
}
\`\`\`
`
    },
    {
      path: 'src/shared/components/.gitkeep',
      description: 'Keep shared components directory',
      content: ''
    },
    {
      path: 'src/shared/utils/.gitkeep',
      description: 'Keep shared utils directory',
      content: ''
    },
    {
      path: 'src/shared/types/.gitkeep',
      description: 'Keep shared types directory',
      content: ''
    }
  ]
}
