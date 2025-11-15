/**
 * CreateUserDto - Input for creating a user
 * API contract - independent from entity
 */
export class CreateUserDto {
  email: string
  name: string
  password: string  // Raw password (not hash)
}
