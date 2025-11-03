/**
 * User entity - Pure business logic with no external dependencies
 *
 * This is the heart of hexagonal architecture - domain layer has:
 * - Zero dependencies on infrastructure
 * - No knowledge of databases, HTTP, CLI, etc.
 * - Only business rules and validation logic
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {
    // Business rule: Email must be valid
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Business rule: Name cannot be empty
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty')
    }
  }

  /**
   * Business logic: Validate email format
   * Note: This is simplified for demonstration purposes
   */
  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.')
  }

  /**
   * Business method: Get display name
   */
  getDisplayName(): string {
    return `${this.name} (${this.email})`
  }
}
