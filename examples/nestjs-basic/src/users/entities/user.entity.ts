/**
 * User entity - Database model
 * Contains internal database fields like passwordHash
 */
export class User {
  id: number
  email: string
  name: string
  passwordHash: string  // Internal detail, NOT exposed in API
  createdAt: Date
}
