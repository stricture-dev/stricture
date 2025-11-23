import type { ArchRule } from '@stricture/core'

/**
 * Next.js architecture rules
 *
 * These rules enforce the dependency constraints for Next.js App Router:
 * - Client Components cannot import server-only code
 * - API routes cannot import UI components
 * - Proper separation between server and client code
 *
 * Rules are automatically sorted by specificity - array order doesn't matter.
 * More specific rules take precedence over wildcards.
 */
export const rules: ArchRule[] = [
  // Critical Restrictions (with custom error messages)
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
  },
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
  },
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
  },

  // Allowed Imports
  {
    id: 'client-to-server-actions',
    name: 'Client Components Can Import Server Actions',
    description: 'Client Components can call Server Actions',
    severity: 'error',
    from: { tag: 'client', mode: 'file' },
    to: { tag: 'actions', mode: 'file' },
    allowed: true
  },
  {
    id: 'server-components-to-server-utils',
    name: 'Server Components Can Import Server Code',
    description: 'Server Components can import server-only utilities',
    severity: 'error',
    from: { tag: 'server', mode: 'file' },
    to: { tag: 'server-utils', mode: 'file' },
    allowed: true
  },
  {
    id: 'server-to-client-components',
    name: 'Server Components Can Import Client Components',
    description: 'Server Components can import and render Client Components',
    severity: 'error',
    from: { tag: 'server', mode: 'file' },
    to: { tag: 'client', mode: 'file' },
    allowed: true
  },
  {
    id: 'client-self-imports',
    name: 'Client Components Can Import Each Other',
    description: 'Client Components can import other Client Components',
    severity: 'error',
    from: { tag: 'client', mode: 'file' },
    to: { tag: 'client', mode: 'file' },
    allowed: true
  },
  {
    id: 'server-self-imports',
    name: 'Server Components Can Import Each Other',
    description: 'Server Components can import other Server Components',
    severity: 'error',
    from: { tag: 'server', mode: 'file' },
    to: { tag: 'server', mode: 'file' },
    allowed: true
  },
  {
    id: 'api-to-server-utils',
    name: 'API Routes Can Import Server Code',
    description: 'API routes can import server-only utilities',
    severity: 'error',
    from: { tag: 'api', mode: 'file' },
    to: { tag: 'server-utils', mode: 'file' },
    allowed: true
  },
  {
    id: 'api-self-imports',
    name: 'API Routes Can Import Each Other',
    description: 'API routes can import shared API utilities',
    severity: 'error',
    from: { tag: 'api', mode: 'file' },
    to: { tag: 'api', mode: 'file' },
    allowed: true
  },
  {
    id: 'all-to-shared',
    name: 'All Code Can Import Shared Utilities',
    description: 'Shared utilities are available to all code',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { tag: 'shared', mode: 'file' },
    allowed: true
  },
  {
    id: 'app-routes-to-server-utils',
    name: 'App Routes Can Import Server Code',
    description: 'App Router pages/layouts can import server-only utilities',
    severity: 'error',
    from: { tag: 'routes', mode: 'file' },
    to: { tag: 'server-utils', mode: 'file' },
    allowed: true
  },
  {
    id: 'app-routes-to-components',
    name: 'App Routes Can Import Components',
    description: 'App Router pages can import both server and client components',
    severity: 'error',
    from: { tag: 'routes', mode: 'file' },
    to: { tag: 'components', mode: 'file' },
    allowed: true
  },
  {
    id: 'app-routes-to-actions',
    name: 'App Routes Can Import Server Actions',
    description: 'App Router pages can use Server Actions',
    severity: 'error',
    from: { tag: 'routes', mode: 'file' },
    to: { tag: 'actions', mode: 'file' },
    allowed: true
  },
  {
    id: 'actions-to-server-utils',
    name: 'Server Actions Can Import Server Code',
    description: 'Server Actions can import server-only utilities',
    severity: 'error',
    from: { tag: 'actions', mode: 'file' },
    to: { tag: 'server-utils', mode: 'file' },
    allowed: true
  },
  {
    id: 'actions-self-imports',
    name: 'Server Actions Can Import Each Other',
    description: 'Server Actions can import other Server Actions',
    severity: 'error',
    from: { tag: 'actions', mode: 'file' },
    to: { tag: 'actions', mode: 'file' },
    allowed: true
  },
  {
    id: 'all-to-external',
    name: 'All Code Can Import External Dependencies',
    description: 'External npm packages are allowed',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'app-routes-self-imports',
    name: 'App Routes Can Import Each Other',
    description: 'App Route files can import other App Route files',
    severity: 'error',
    from: { tag: 'routes', mode: 'file' },
    to: { tag: 'routes', mode: 'file' },
    allowed: true
  },
  {
    id: 'server-utils-self-imports',
    name: 'Server Utils Can Import Each Other',
    description: 'Server utilities can import other server utilities',
    severity: 'error',
    from: { tag: 'server-utils', mode: 'file' },
    to: { tag: 'server-utils', mode: 'file' },
    allowed: true
  },
  {
    id: 'shared-self-imports',
    name: 'Shared Utils Can Import Each Other',
    description: 'Shared utilities can import other shared utilities',
    severity: 'error',
    from: { tag: 'shared', mode: 'file' },
    to: { tag: 'shared', mode: 'file' },
    allowed: true
  }
]
