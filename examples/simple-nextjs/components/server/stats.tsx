/**
 * Server Component for displaying statistics
 * 
 * Demonstrates server-side data processing
 */

import { db } from '@/lib/server/database'

export async function Stats() {
  const todos = await db.todos.findAll()
  
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <StatCard label="Total" value={total} colorClass="bg-blue-50 text-blue-700" />
      <StatCard label="Completed" value={completed} colorClass="bg-green-50 text-green-700" />
      <StatCard label="Pending" value={pending} colorClass="bg-yellow-50 text-yellow-700" />
      <StatCard label="Completion" value={completionRate + '%'} colorClass="bg-purple-50 text-purple-700" />
    </div>
  )
}

function StatCard({ label, value, colorClass }: { label: string, value: number | string, colorClass: string }) {
  return (
    <div className={'p-4 rounded-lg ' + colorClass}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}
