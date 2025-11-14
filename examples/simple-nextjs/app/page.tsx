/**
 * App Router Page (Server Component by default)
 * 
 * ✅ Can import Server Components
 * ✅ Can import Client Components
 * ✅ Can import Server Actions
 * ✅ Can import server-only code
 */

import { Suspense } from 'react'
import { Stats } from '@/components/server/stats'
import { TodoList } from '@/components/server/todo-list'
import { AddTodoForm } from '@/components/client/add-todo-form'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Todo App
        </h1>
        <p className="text-gray-600">
          A minimal Next.js example demonstrating <code className="px-2 py-1 bg-gray-100 rounded">@stricture/nextjs</code> architecture boundaries
        </p>
      </header>

      {/* Stats - Server Component */}
      <Suspense fallback={<StatsLoading />}>
        <Stats />
      </Suspense>

      {/* Add Todo Form - Client Component */}
      <AddTodoForm />

      {/* Todo List - Server Component with Client Components inside */}
      <Suspense fallback={<ListLoading />}>
        <TodoList />
      </Suspense>

      <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          This example demonstrates proper Next.js architecture:
        </p>
        <ul className="mt-4 space-y-1">
          <li>✅ Server Components fetch data directly</li>
          <li>✅ Client Components handle interactivity</li>
          <li>✅ Server Actions for mutations</li>
          <li>✅ API Routes for external access</li>
          <li>✅ Proper separation enforced by Stricture</li>
        </ul>
      </footer>
    </main>
  )
}

function StatsLoading() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 rounded-lg bg-gray-100 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

function ListLoading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 border rounded-lg bg-gray-50 animate-pulse">
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}
