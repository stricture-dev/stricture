'use server'

/**
 * Server Actions for todo management
 * 
 * These functions run on the server but can be imported
 * and called from Client Components.
 */

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/server/database'

export async function getTodos() {
  const todos = await db.todos.findAll()
  return todos
}

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string
  
  if (!title || title.trim() === '') {
    throw new Error('Title is required')
  }
  
  await db.todos.create({
    title: title.trim(),
    completed: false
  })
  
  revalidatePath('/')
}

export async function toggleTodo(id: string) {
  const todo = await db.todos.findById(id)
  if (!todo) {
    throw new Error('Todo not found')
  }
  
  await db.todos.update(id, {
    completed: !todo.completed
  })
  
  revalidatePath('/')
}

export async function deleteTodo(id: string) {
  await db.todos.delete(id)
  revalidatePath('/')
}
