import type { ScaffoldingTemplate } from '@stricture/core'

/**
 * Next.js architecture scaffolding template
 *
 * Provides directory structure and example files for setting up
 * a Next.js App Router project with proper boundaries.
 */
export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'app',
      description: 'App Router - pages, layouts, and route handlers'
    },
    {
      path: 'app/api',
      description: 'API route handlers'
    },
    {
      path: 'components/server',
      description: 'Server Components (default) - can use server-only code'
    },
    {
      path: 'components/client',
      description: 'Client Components with "use client" directive'
    },
    {
      path: 'actions',
      description: 'Server Actions with "use server" directive'
    },
    {
      path: 'lib/server',
      description: 'Server-only utilities - database, auth, email, etc.'
    },
    {
      path: 'lib/utils',
      description: 'Shared utilities that work on both server and client'
    }
  ],
  files: [
    {
      path: 'components/server/README.md',
      content: `# Server Components

React Server Components that run on the server.

## Guidelines

- ✅ Can import server-only utilities (\`lib/server/**\`)
- ✅ Can import Client Components
- ✅ Can use \`async/await\` for data fetching
- ✅ Can access databases, file system, environment variables
- ❌ Cannot use React hooks (\`useState\`, \`useEffect\`, etc.)
- ❌ Cannot use browser APIs
- ❌ Cannot handle user interactions directly

## Example

\`\`\`typescript
// components/server/user-list.tsx
import { db } from '@/lib/server/database'
import { UserCard } from '@/components/client/user-card'

export async function UserList() {
  const users = await db.user.findMany()
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
\`\`\`
`,
      description: 'Server Components documentation'
    },
    {
      path: 'components/client/README.md',
      content: `# Client Components

React Client Components that run in the browser.

## Guidelines

- ✅ Can use React hooks (\`useState\`, \`useEffect\`, etc.)
- ✅ Can handle user interactions
- ✅ Can import other Client Components
- ✅ Can call Server Actions
- ✅ Can fetch from API routes
- ✅ Can import shared utilities (\`lib/utils/**\`)
- ❌ Cannot import server-only utilities (\`lib/server/**\`)
- ❌ Cannot import API route handlers directly
- ❌ Cannot directly access databases

## Example

\`\`\`typescript
// components/client/search-bar.tsx
'use client'

import { useState } from 'react'
import { searchUsers } from '@/actions/users'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  
  const handleSearch = async () => {
    const data = await searchUsers(query)
    setResults(data)
  }
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      {/* Render results */}
    </div>
  )
}
\`\`\`
`,
      description: 'Client Components documentation'
    },
    {
      path: 'lib/server/README.md',
      content: `# Server-Only Utilities

Code that should NEVER be included in the client bundle.

## Guidelines

- ✅ Database connections and queries
- ✅ Authentication and authorization
- ✅ Environment variables and secrets
- ✅ File system operations
- ✅ Email sending
- ✅ Server-side API calls
- ⚠️  Install \`server-only\` package for runtime protection

## Example

\`\`\`typescript
// lib/server/database.ts
import 'server-only'  // Runtime protection
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()

// lib/server/auth.ts
import 'server-only'
import { cookies } from 'next/headers'

export async function getSession() {
  const sessionCookie = cookies().get('session')
  // ... validate session
}
\`\`\`
`,
      description: 'Server-only utilities documentation'
    },
    {
      path: 'actions/README.md',
      content: `# Server Actions

Functions that run on the server, callable from both Server and Client Components.

## Guidelines

- ✅ Must have \`'use server'\` directive
- ✅ Can import server-only utilities
- ✅ Can be called from Client Components
- ✅ Great for form submissions and mutations
- ✅ Automatic type safety with TypeScript
- ❌ Cannot use React hooks

## Example

\`\`\`typescript
// actions/users.ts
'use server'

import { db } from '@/lib/server/database'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  await db.user.create({
    data: { name, email }
  })
  
  revalidatePath('/users')
}

export async function getUsers() {
  return db.user.findMany()
}
\`\`\`

## Usage in Client Component

\`\`\`typescript
// components/client/create-user-form.tsx
'use client'

import { createUser } from '@/actions/users'

export function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" />
      <input name="email" />
      <button type="submit">Create</button>
    </form>
  )
}
\`\`\`
`,
      description: 'Server Actions documentation'
    },
    {
      path: 'app/api/README.md',
      content: `# API Routes

RESTful API endpoints for external access or client-side fetching.

## Guidelines

- ✅ Can import server-only utilities
- ✅ Return JSON responses
- ✅ Handle GET, POST, PUT, DELETE, etc.
- ✅ Can set custom headers and status codes
- ❌ Cannot import UI components
- ❌ Should not contain UI logic

## When to Use

- External API access (mobile app, third-party)
- Webhooks
- Traditional REST endpoints
- When you need full control over HTTP response

## Example

\`\`\`typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/server/database'

export async function GET() {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await db.user.create({
    data: body
  })
  return NextResponse.json(user, { status: 201 })
}
\`\`\`

## Usage

\`\`\`typescript
// From Client Component
const response = await fetch('/api/users')
const users = await response.json()
\`\`\`
`,
      description: 'API routes documentation'
    }
  ]
}
