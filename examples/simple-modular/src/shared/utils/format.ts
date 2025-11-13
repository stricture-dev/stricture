/**
 * Shared formatting utilities
 */

export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}
