/**
 * API Route for todos
 * 
 * ✅ Can import server-only code (lib/server/*)
 * ✅ Can import other API routes
 * ❌ Cannot import UI components
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/server/database'

export async function GET() {
  try {
    const todos = await db.todos.findAll()
    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const todo = await db.todos.create({
      title,
      completed: false
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
