/**
 * Simple in-memory database for the example
 * In a real application, this would be replaced with a real database client
 * (PostgreSQL, MongoDB, etc.)
 */

interface Database {
  users: Map<string, any>
  orders: Map<string, any>
}

/**
 * Singleton database instance
 * All features share this database
 */
export const db: Database = {
  users: new Map(),
  orders: new Map()
}
