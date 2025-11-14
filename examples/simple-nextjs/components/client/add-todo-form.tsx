'use client'

/**
 * Client Component for adding todos
 * 
 * Demonstrates using Server Actions from Client Components
 */

import { useRef, useState } from 'react'
import { createTodo } from '@/actions/todos'

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await createTodo(formData)
      formRef.current?.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex gap-2 mb-6"
    >
      <input
        name="title"
        type="text"
        placeholder="What needs to be done?"
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add'}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </form>
  )
}
