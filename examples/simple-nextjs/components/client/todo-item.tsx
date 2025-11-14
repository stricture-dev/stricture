'use client'

/**
 * Client Component for interactive todo item
 * 
 * ✅ Can use React hooks (useState, useEffect, etc.)
 * ✅ Can call Server Actions
 * ✅ Can import shared utilities
 * ❌ Cannot import server-only code (lib/server/*)
 */

import { useState } from 'react'
import { toggleTodo, deleteTodo } from '@/actions/todos'
import { classNames } from '@/lib/utils/format'

interface TodoItemProps {
  id: string
  title: string
  completed: boolean
}

export function TodoItem({ id, title, completed }: TodoItemProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await toggleTodo(id)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteTodo(id)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-3 p-4 border rounded-lg',
        isLoading ? 'opacity-50' : '',
        completed ? 'bg-green-50' : 'bg-white'
      )}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        disabled={isLoading}
        className="w-5 h-5 cursor-pointer"
      />
      <span
        className={classNames(
          'flex-1',
          completed ? 'line-through text-gray-500' : 'text-gray-900'
        )}
      >
        {title}
      </span>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
      >
        Delete
      </button>
    </div>
  )
}
