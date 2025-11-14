/**
 * Server-only database utilities
 * 
 * This file demonstrates server-only code that should NEVER
 * be imported by client components.
 */

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

// In-memory database for demo purposes
const todos: Todo[] = [
  {
    id: '1',
    title: 'Learn Next.js App Router',
    completed: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Understand Server Components',
    completed: true,
    createdAt: new Date('2024-01-02')
  },
  {
    id: '3',
    title: 'Master Client Components',
    completed: false,
    createdAt: new Date('2024-01-03')
  }
]

export const db = {
  todos: {
    findAll: async (): Promise<Todo[]> => {
      // Simulate async database call
      return Promise.resolve([...todos])
    },
    
    findById: async (id: string): Promise<Todo | null> => {
      const todo = todos.find(t => t.id === id)
      return Promise.resolve(todo || null)
    },
    
    create: async (data: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> => {
      const todo: Todo = {
        ...data,
        id: String(todos.length + 1),
        createdAt: new Date()
      }
      todos.push(todo)
      return Promise.resolve(todo)
    },
    
    update: async (id: string, data: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo | null> => {
      const index = todos.findIndex(t => t.id === id)
      if (index === -1) return null
      
      todos[index] = { ...todos[index], ...data }
      return Promise.resolve(todos[index])
    },
    
    delete: async (id: string): Promise<boolean> => {
      const index = todos.findIndex(t => t.id === id)
      if (index === -1) return false
      
      todos.splice(index, 1)
      return true
    }
  }
}
