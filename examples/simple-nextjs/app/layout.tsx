import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simple Next.js - Stricture Example',
  description: 'Demonstrates Next.js App Router architecture with Stricture boundary enforcement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
