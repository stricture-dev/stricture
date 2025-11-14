/**
 * Server Component for rendering todo list
 * 
 * ✅ Can import server-only code (lib/server/*)
 * ✅ Can import Client Components
 * ✅ Can use async/await for data fetching
 * ❌ Cannot use React hooks
 * ❌ Cannot handle user interactions directly
 */

import { db } from '@/lib/server/database'
import { formatDate } from '@/lib/utils/format'
import { TodoItem } from '@/components/client/todo-item'

export async function TodoList() {
  // Server Components can directly access the database
  const todos = await db.todos.findAll()

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No todos yet. Add one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div key={todo.id}>
          {/* Server Component rendering Client Component */}
          <TodoItem
            id={todo.id}
            title={todo.title}
            completed={todo.completed}
          />
          <p className="text-xs text-gray-500 mt-1 ml-11">
            Created: {formatDate(todo.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )
}
