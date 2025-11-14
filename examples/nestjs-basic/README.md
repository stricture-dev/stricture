# NestJS Basic Example

Demonstrates `@stricture/nestjs` preset with a simple users API.

## Architecture

This example shows:
- **DTOs** for API contracts (input/output)
- **Entities** for internal database models
- **Services** for business logic
- **Controllers** for HTTP handling
- **Proper separation** between API and database layers

## Key Points

### DTO/Entity Separation

**Entities** (database models):
```typescript
// src/users/entities/user.entity.ts
export class User {
  id: number
  email: string
  passwordHash: string  // Internal detail
}
```

**DTOs** (API contracts):
```typescript
// src/users/dto/user.dto.ts
export class UserDto {
  id: number
  email: string
  // No passwordHash - never exposed in API!
}
```

### Controllers Use DTOs

```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  @Get()
  findAll(): Promise<UserDto[]> {  // DTO, not Entity!
    return this.usersService.findAll()
  }
}
```

### Services Convert Entities to DTOs

```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  async findAll(): Promise<UserDto[]> {
    const users = this.getUsers()  // Returns entities
    return users.map(u => this.toDto(u))  // Convert to DTOs
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email
      // passwordHash not included!
    }
  }
}
```

## What Stricture Enforces

The preset prevents:
- ❌ Controllers importing entities
- ❌ DTOs importing entities
- ❌ Controllers importing repositories
- ❌ Controllers importing other controllers

The preset allows:
- ✅ Controllers importing services
- ✅ Controllers importing DTOs
- ✅ Services importing entities
- ✅ Services importing repositories

## Running the Example

```bash
# Install dependencies
pnpm install

# Run linter (includes Stricture checks)
pnpm lint

# Start the server
pnpm start:dev
```

## Testing the API

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"secret123"}'

# Get all users
curl http://localhost:3000/users

# Note: passwordHash is never exposed in the API response!
```

## Benefits

✅ **Security** - Sensitive fields (like passwordHash) never accidentally exposed
✅ **API Evolution** - Change database schema without breaking API
✅ **Type Safety** - DTOs provide compile-time validation
✅ **Maintainability** - Clear separation of concerns
