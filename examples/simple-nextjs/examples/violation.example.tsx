/**
 * Architectural Violation Examples
 * 
 * These examples demonstrate common mistakes that Stricture prevents.
 * DO NOT import these files - they will cause ESLint errors!
 */

// ❌ VIOLATION 1: Client Component importing server-only code
// File: components/client/bad-client-component.tsx
'use client'

import { db } from '@/lib/server/database'  // ❌ ERROR!

export function BadClientComponent() {
  // Stricture Error:
  // Client Components cannot import server-only code.
  // Use Server Actions or API routes instead.
  
  // Fix: Use a Server Action instead
  // import { getTodos } from '@/actions/todos'
  // const todos = await getTodos()
  
  return <div>Bad Example</div>
}

// ❌ VIOLATION 2: API Route importing UI components
// File: app/api/bad/route.ts

import { TodoItem } from '@/components/client/todo-item'  // ❌ ERROR!
import { NextResponse } from 'next/server'

export async function GET() {
  // Stricture Error:
  // API routes should contain business logic only, not UI components.
  
  // Fix: Keep API routes focused on data/business logic
  // import { db } from '@/lib/server/database'
  // const todos = await db.todos.findAll()
  // return NextResponse.json(todos)
  
  return NextResponse.json({ error: 'Bad example' })
}

// ❌ VIOLATION 3: Client Component importing API route handler
// File: components/client/bad-api-importer.tsx
'use client'

import { GET } from '@/app/api/todos/route'  // ❌ ERROR!

export function BadAPIImporter() {
  // Stricture Error:
  // Client Components should fetch from API routes, not import them.
  
  // Fix: Use fetch instead
  // const response = await fetch('/api/todos')
  // const todos = await response.json()
  
  return <div>Bad Example</div>
}

// ❌ VIOLATION 4: Server-only code accessing client-side APIs
// File: lib/server/bad-server-util.ts

export function badServerFunction() {
  // This would work if imported in client code, but is architecturally wrong
  const width = window.innerWidth  // ❌ Wrong! Server code shouldn't use browser APIs
  
  // Fix: Keep server code pure and browser-independent
  // Or use client-side code for browser APIs
}

// ✅ CORRECT PATTERNS

// ✅ Server Component using server-only code
// File: components/server/good-server-component.tsx

import { db } from '@/lib/server/database'

export async function GoodServerComponent() {
  const todos = await db.todos.findAll()
  return <div>{todos.length} todos</div>
}

// ✅ Client Component calling Server Action
// File: components/client/good-client-component.tsx
'use client'

import { useState } from 'react'
import { createTodo } from '@/actions/todos'

export function GoodClientComponent() {
  const [title, setTitle] = useState('')
  
  const handleSubmit = async () => {
    await createTodo(new FormData([['title', title]]))
  }
  
  return <button onClick={handleSubmit}>Add Todo</button>
}

// ✅ API Route using server utilities
// File: app/api/good/route.ts

import { db } from '@/lib/server/database'
import { NextResponse } from 'next/server'

export async function GET() {
  const todos = await db.todos.findAll()
  return NextResponse.json(todos)
}
