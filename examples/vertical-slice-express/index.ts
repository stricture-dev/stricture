#!/usr/bin/env node
/**
 * Composition Root - Main Entry Point
 *
 * This file wires all feature slices together into a single Express application.
 * Each feature provides its own router, and this file mounts them onto the app.
 *
 * Key principle: Only this file knows about all features.
 * Features remain isolated from each other.
 */

import express, { Express } from 'express'
import { router as userRegistrationRouter } from './src/features/user-registration/endpoint.js'
import { router as userProfileRouter } from './src/features/user-profile/endpoint.js'
import { router as orderCreationRouter } from './src/features/order-creation/endpoint.js'
import { router as orderHistoryRouter } from './src/features/order-history/endpoint.js'

// Create Express application
const app: Express = express()

// Middleware
app.use(express.json())

// Mount feature routers
// Each feature slice provides its own router with routes
app.use('/api', userRegistrationRouter)
app.use('/api', userProfileRouter)
app.use('/api', orderCreationRouter)
app.use('/api', orderHistoryRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✨ Vertical Slice Architecture Example`)
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 Available endpoints:`)
  console.log(`   POST   /api/users/register`)
  console.log(`   GET    /api/users/:id`)
  console.log(`   POST   /api/orders`)
  console.log(`   GET    /api/users/:userId/orders`)
  console.log(`   GET    /health`)
  console.log('')
  console.log(`💡 Try: curl -X POST http://localhost:${PORT}/api/users/register \\`)
  console.log(`         -H "Content-Type: application/json" \\`)
  console.log(`         -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'`)
})

// Export app for testing
export { app }
