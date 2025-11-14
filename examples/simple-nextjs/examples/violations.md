# Architectural Violation Examples

These examples demonstrate common mistakes that Stricture prevents.
DO NOT compile these files - they contain intentionally bad code!

## ❌ VIOLATION 1: Client Component importing server-only code

**File**: `components/client/bad-client-component.tsx`

```tsx
'use client'

import { db } from '@/lib/server/database'  // ❌ ERROR!

export function BadClientComponent() {
  // Stricture Error:
  // Client Components cannot import server-only code.
  // Use Server Actions or API routes instead.
  
  return <div>Bad Example</div>
}
```

**Fix: Use a Server Action instead**

```tsx
// actions/get-data.ts
'use server'
import { db } from '@/lib/server/database'

export async function getData() {
  return db.todos.findAll()
}

// components/client/good-client-component.tsx
'use client'
import { getData } from '@/actions/get-data'

export function GoodClientComponent() {
  // Use Server Action
  const handleClick = async () => {
    const data = await getData()
    console.log(data)
  }
  
  return <button onClick={handleClick}>Get Data</button>
}
```

---

## ❌ VIOLATION 2: API Route importing UI components

**File**: `app/api/bad/route.ts`

```ts
import { TodoItem } from '@/components/client/todo-item'  // ❌ ERROR!
import { NextResponse } from 'next/server'

export async function GET() {
  // Stricture Error:
  // API routes should contain business logic only, not UI components.
  
  return NextResponse.json({ error: 'Bad example' })
}
```

**Fix: Keep API routes focused on data/business logic**

```ts
// app/api/todos/route.ts
import { db } from '@/lib/server/database'
import { NextResponse } from 'next/server'

export async function GET() {
  const todos = await db.todos.findAll()
  return NextResponse.json(todos)
}
```

---

## ❌ VIOLATION 3: Client Component importing API route handler

**File**: `components/client/bad-api-importer.tsx`

```tsx
'use client'

import { GET } from '@/app/api/todos/route'  // ❌ ERROR!

export function BadAPIImporter() {
  // Stricture Error:
  // Client Components should fetch from API routes, not import them.
  
  return <div>Bad Example</div>
}
```

**Fix: Use fetch instead**

```tsx
'use client'

import { useEffect, useState } from 'react'

export function GoodAPIUser() {
  const [todos, setTodos] = useState([])
  
  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(setTodos)
  }, [])
  
  return <div>{todos.length} todos</div>
}
```

---

## ❌ VIOLATION 4: Server-only code accessing client-side APIs

**File**: `lib/server/bad-server-util.ts`

```ts
export function badServerFunction() {
  // This would work if imported in client code, but is architecturally wrong
  const width = window.innerWidth  // ❌ Wrong! Server code shouldn't use browser APIs
  
  return width
}
```

**Fix: Keep server code pure and browser-independent**

```ts
// lib/server/good-server-util.ts
export function goodServerFunction() {
  // Pure server-side logic - no browser APIs
  return new Date().toISOString()
}

// Or use client-side code for browser APIs
// components/client/viewport.tsx
'use client'

export function useViewport() {
  const [width, setWidth] = useState(window.innerWidth)
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return width
}
```

---

## ✅ CORRECT PATTERNS

### ✅ Server Component using server-only code

**File**: `components/server/good-server-component.tsx`

```tsx
import { db } from '@/lib/server/database'

export async function GoodServerComponent() {
  const todos = await db.todos.findAll()
  return <div>{todos.length} todos</div>
}
```

### ✅ Client Component calling Server Action

**File**: `components/client/good-client-component.tsx`

```tsx
'use client'

import { useState } from 'react'
import { createTodo } from '@/actions/todos'

export function GoodClientComponent() {
  const [title, setTitle] = useState('')
  
  const handleSubmit = async () => {
    const formData = new FormData()
    formData.set('title', title)
    await createTodo(formData)
  }
  
  return <button onClick={handleSubmit}>Add Todo</button>
}
```

### ✅ API Route using server utilities

**File**: `app/api/good/route.ts`

```ts
import { db } from '@/lib/server/database'
import { NextResponse } from 'next/server'

export async function GET() {
  const todos = await db.todos.findAll()
  return NextResponse.json(todos)
}
```
