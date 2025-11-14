/**
 * Shared utilities that work on both server and client
 * 
 * These functions are pure and have no side effects,
 * making them safe to use anywhere.
 */

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
