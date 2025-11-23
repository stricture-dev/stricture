import type { ArchRule } from '@stricture/core'

export const rules: ArchRule[] = [
  // ============================================================================
  // Type Definitions (Highest Specificity)
  // ============================================================================
  {
    id: 'types-external-allowed',
    name: 'TypeScript Type Definitions Allowed',
    description: 'All modules can use TypeScript type definitions from @types',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { pattern: 'node_modules/@types/**', mode: 'file' },
    allowed: true
  },

  // ============================================================================
  // Module Public API Rules
  // ============================================================================
  {
    id: 'module-public-self-imports',
    name: 'Public API Can Import Within Features',
    description: 'Module public APIs (index.ts) can import from the features boundary',
    severity: 'error',
    from: { tag: 'module-public', mode: 'file' },
    to: { tag: 'features', mode: 'file' },
    allowed: true
  },
  {
    id: 'module-public-to-shared',
    name: 'Public API Can Use Shared',
    description: 'Module public APIs can import shared utilities',
    severity: 'error',
    from: { tag: 'module-public', mode: 'file' },
    to: { tag: 'shared', mode: 'file' },
    allowed: true
  },
  {
    id: 'module-public-external',
    name: 'Public API Can Use External Libraries',
    description: 'Module public APIs can import external packages',
    severity: 'error',
    from: { tag: 'module-public', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ============================================================================
  // Module Internal Rules
  // ============================================================================
  {
    id: 'module-internal-self-imports',
    name: 'Module Internals Can Import Within Features',
    description: 'Internal files can import other files within the features boundary',
    severity: 'error',
    from: { tag: 'module-internal', mode: 'file' },
    to: { tag: 'features', mode: 'file' },
    allowed: true
  },
  {
    id: 'module-internal-to-module-public',
    name: 'Modules Can Import Other Public APIs',
    description: 'Internal files can import from other modules via their public APIs (index.ts)',
    severity: 'error',
    from: { tag: 'module-internal', mode: 'file' },
    to: { tag: 'module-public', mode: 'file' },
    allowed: true
  },
  {
    id: 'module-internal-to-shared',
    name: 'Modules Can Use Shared Utilities',
    description: 'Internal files can import shared utilities',
    severity: 'error',
    from: { tag: 'module-internal', mode: 'file' },
    to: { tag: 'shared', mode: 'file' },
    allowed: true
  },
  {
    id: 'module-internal-external',
    name: 'Modules Can Use External Libraries',
    description: 'Internal files can import external packages',
    severity: 'error',
    from: { tag: 'module-internal', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ============================================================================
  // Shared Utilities Rules
  // ============================================================================
  {
    id: 'shared-self-imports',
    name: 'Shared Can Import Itself',
    description: 'Shared utilities can import other shared utilities',
    severity: 'error',
    from: { tag: 'shared', mode: 'file' },
    to: { tag: 'shared', mode: 'file' },
    allowed: true
  },
  {
    id: 'shared-external',
    name: 'Shared Can Use External Libraries',
    description: 'Shared utilities can import external packages',
    severity: 'error',
    from: { tag: 'shared', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'shared-not-features',
    name: 'Shared Cannot Import Features',
    description: 'Shared utilities cannot import from feature modules',
    severity: 'error',
    from: { tag: 'shared', mode: 'file' },
    to: { tag: 'features', mode: 'file' },
    allowed: false,
    message: 'Shared utilities cannot import from feature modules. Shared code should remain generic and feature-independent. If you need feature-specific logic, move it to that feature module or parameterize the shared utility.',
    examples: {
      bad: [
        "// src/shared/utils/auth-helper.ts\nimport { User } from '../../features/auth/types'  // ❌ Creates coupling",
        "// src/shared/components/user-card.tsx\nimport { formatUserName } from '../../features/users/utils'  // ❌ Wrong direction"
      ],
      good: [
        "// src/shared/utils/auth-helper.ts\n// Option 1: Pass as parameter\nexport function formatUser(user: { name: string; email: string }) {\n  return `${user.name} <${user.email}>`\n}",
        "// src/shared/utils/auth-helper.ts\n// Option 2: Define generic interface in shared\nexport interface UserLike {\n  name: string\n  email: string\n}\nexport function formatUser(user: UserLike) {\n  return `${user.name} <${user.email}>`\n}"
      ]
    }
  }
]
