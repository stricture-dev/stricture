/**
 * UserDto - Output for API responses
 * Does NOT include sensitive fields like passwordHash
 */
export class UserDto {
  id: number
  email: string
  name: string
  createdAt: Date
  // Note: passwordHash is NOT included!
}
