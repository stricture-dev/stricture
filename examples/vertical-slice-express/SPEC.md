# Vertical Slice Architecture - Technical Specification

## Overview

**Package:** `@stricture-examples/vertical-slice-express`
**Purpose:** Demonstration of Vertical Slice Architecture with Stricture feature isolation enforcement
**Type:** Example project (not a published package)
**License:** MIT

### Key Features

- **Express.js REST API** for user and order management
- **Feature-based organization** where each feature is a complete vertical slice
- **Custom Stricture configuration** (no preset) demonstrating feature isolation
- **Minimal shared infrastructure** (database, validation, HTTP utilities)
- **Educational focus** showing how VSA differs from traditional layered architectures

## Objectives

This example aims to teach developers:

1. **How to structure a vertical slice architecture project** with feature-based organization
2. **How to configure Stricture for feature isolation** using custom boundaries and rules
3. **How to prevent coupling between features** while allowing shared infrastructure
4. **When to use VSA vs other architectures** (Hexagonal, Clean, Layered)
5. **How to handle cross-feature communication** without direct imports

## Architecture Overview

### What is Vertical Slice Architecture?

Vertical Slice Architecture (VSA) is an organizational pattern where code is structured by **features** or **use cases** rather than technical layers. Each feature slice contains all the code needed to implement a single use case, cutting vertically through all technical concerns (HTTP, validation, business logic, data access).

**Core Principle:** Features are **isolated** from each other and can only share code through generic **infrastructure utilities** in the `shared/` directory.

### Key Differences from Other Architectures

| Aspect | Layered | Hexagonal | VSA |
|--------|---------|-----------|-----|
| **Organization** | By technical layer | By architectural ring | By feature/use case |
| **Primary Boundary** | Layer (controller, service, repo) | Domain vs Adapters | Feature vs Feature |
| **Code Location** | Scattered across layers | Grouped by domain | Grouped by feature |
| **Coupling** | High (features share layers) | Low (domain isolated) | Very low (features isolated) |
| **Abstraction** | Encouraged | Required for ports | Minimal (prefer duplication) |

### Feature Isolation

**Rule:** Features CANNOT import from other features.

**Why:** This enforces loose coupling between features. When features can't directly import each other, they must communicate through well-defined boundaries (HTTP APIs, events, or shared infrastructure).

**Stricture Enforcement:** Deny-by-default policy automatically prevents feature-to-feature imports. No explicit denial rule needed.

---

## Feature Slices

Each feature slice represents a single use case. Let's examine each feature in detail.

### User Registration Feature

**Directory:** `src/features/user-registration/`

**Purpose:** Handle new user registration

**Files:**
- `endpoint.ts` - HTTP route and request handling
- `command.ts` - Business logic for creating users
- `validator.ts` - Feature-specific validation logic

#### Endpoint (`endpoint.ts`)

**Responsibilities:**
- Define Express router for `/api/users/register`
- Handle HTTP request/response
- Coordinate validator and command
- Handle errors and return appropriate HTTP status codes

**Key Characteristics:**
- **Thin controller** - delegates to command for business logic
- **HTTP-specific** - knows about Express Request/Response
- **Error handling** - catches exceptions and maps to HTTP responses
- **No business logic** - pure HTTP adapter

**Implementation:**
```typescript
import express from 'express'
import { registerUser } from './command.js'
import { validateRegistration } from './validator.js'
import { success, error } from '../../shared/http/response.js'

export const router = express.Router()

router.post('/users/register', async (req, res) => {
  try {
    // 1. Validate
    const validation = validateRegistration(req.body)
    if (!validation.valid) {
      return error(res, 400, validation.error!)
    }

    // 2. Execute business logic
    const user = await registerUser(validation.data!)

    // 3. Return response
    return success(res, 201, { user })
  } catch (err) {
    return error(res, 500, 'Internal server error')
  }
})
```

**Stricture Rules Applied:**
- Can import from `shared/` (HTTP utilities)
- Can import from same feature (`./command`, `./validator`)
- Cannot import from other features (enforced by deny-by-default)

#### Command (`command.ts`)

**Responsibilities:**
- Implement business logic for user registration
- Generate unique user IDs
- Create user objects
- Persist users via shared database

**Key Characteristics:**
- **Business logic** - contains the "how" of user registration
- **Pure function** - no side effects except database writes
- **Framework-agnostic** - no Express/HTTP knowledge
- **Testable** - can be tested without HTTP

**Implementation:**
```typescript
import { db } from '../../shared/database/client.js'

export interface RegisterUserInput {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export async function registerUser(input: RegisterUserInput): Promise<User> {
  const userId = generateUserId()
  const now = new Date()

  const user: User = {
    id: userId,
    name: input.name,
    email: input.email,
    createdAt: now
  }

  await db.users.set(userId, user)

  return user
}

function generateUserId(): string {
  return `user_${Math.random().toString(36).substr(2, 9)}`
}
```

**Stricture Rules Applied:**
- Can import from `shared/` (database client)
- Cannot import from other features
- Cannot import HTTP-specific code (separation of concerns)

#### Validator (`validator.ts`)

**Responsibilities:**
- Validate raw request body data
- Type-safe transformation of `any` to `RegisterUserInput`
- Return validation errors with helpful messages

**Key Characteristics:**
- **Feature-specific** - each feature has its own validation needs
- **Type guard** - narrows `any` to specific type
- **Explicit errors** - returns structured validation results
- **Uses shared utilities** - imports generic validation from `shared/`

**Implementation:**
```typescript
import { isValidEmail } from '../../shared/validation/email.js'
import { RegisterUserInput } from './command.js'

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  error?: string
}

export function validateRegistration(body: any): ValidationResult<RegisterUserInput> {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' }
  }

  if (!body.email || typeof body.email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  if (!isValidEmail(body.email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  return {
    valid: true,
    data: {
      name: body.name.trim(),
      email: body.email.toLowerCase(),
      password: body.password
    }
  }
}
```

**Stricture Rules Applied:**
- Can import from `shared/` (email validation utility)
- Can import from same feature (`./command` for types)
- Feature-specific logic stays in feature

#### Why This Structure?

**Endpoint → Validator → Command** flow:

1. **Separation of concerns** - HTTP, validation, business logic are separate
2. **Testability** - Can test command without HTTP, validator without command
3. **Reusability** - Command could be called from CLI, GraphQL, or other entry points
4. **Maintainability** - All code for one feature in one place

---

### User Profile Feature

**Directory:** `src/features/user-profile/`

**Purpose:** Retrieve user profile by ID

**Files:**
- `endpoint.ts` - HTTP route for `GET /api/users/:id`
- `query.ts` - Business logic for fetching user data

#### Key Differences from User Registration

- **Query vs Command** - Uses `query.ts` for read operations, `command.ts` for writes
- **No validator** - GET requests don't need body validation (ID comes from URL)
- **Simpler flow** - Endpoint → Query → Response

**Implementation (`query.ts`):**
```typescript
import { db } from '../../shared/database/client.js'

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = db.users.get(userId)
  return user || null
}
```

**Why Query vs Command?**

- **CQRS pattern** - Separates reads (queries) from writes (commands)
- **Clarity** - File name indicates intent (reading vs writing)
- **Future scaling** - Queries and commands may have different optimizations

---

### Order Creation Feature

**Directory:** `src/features/order-creation/`

**Purpose:** Create new orders for users

**Files:**
- `endpoint.ts` - HTTP route for `POST /api/orders`
- `command.ts` - Business logic for order creation

**Cross-Feature Consideration:**

Orders reference users (`userId` field), but the feature does NOT import from `user-registration` or `user-profile`. Instead:

1. **Receives userId as input** - HTTP request includes `userId`
2. **Trusts the ID exists** - Assumes user exists (could add validation)
3. **No direct coupling** - Order feature doesn't know about user creation logic

**Implementation (`command.ts`):**
```typescript
import { db } from '../../shared/database/client.js'

export interface CreateOrderInput {
  userId: string
  items: string[]
  total: number
}

export interface Order {
  id: string
  userId: string
  items: string[]
  total: number
  createdAt: Date
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderId = generateOrderId()
  const now = new Date()

  const order: Order = {
    id: orderId,
    userId: input.userId,
    items: input.items,
    total: input.total,
    createdAt: now
  }

  await db.orders.set(orderId, order)

  return order
}

function generateOrderId(): string {
  return `order_${Math.random().toString(36).substr(2, 9)}`
}
```

**Stricture Enforcement:**

- ❌ Cannot import `User` type from `user-registration` feature
- ✅ Uses primitive `userId: string` instead
- ✅ Can import from `shared/database` to persist orders

**Alternative Approaches:**

If strong typing between features is needed:
1. **Extract to shared** - Create `src/shared/types/user.ts` with `User` interface
2. **Use events** - Emit `UserCreated` event with typed payload
3. **API contracts** - Use OpenAPI/GraphQL schema as shared contract

---

### Order History Feature

**Directory:** `src/features/order-history/`

**Purpose:** Retrieve all orders for a specific user

**Files:**
- `endpoint.ts` - HTTP route for `GET /api/users/:userId/orders`
- `query.ts` - Business logic for querying orders

**Implementation (`query.ts`):**
```typescript
import { db } from '../../shared/database/client.js'

export interface Order {
  id: string
  userId: string
  items: string[]
  total: number
  createdAt: Date
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const allOrders = Array.from(db.orders.values())
  return allOrders.filter(order => order.userId === userId)
}
```

**Note:** `Order` interface is duplicated in both `order-creation` and `order-history`. This is intentional in VSA—**prefer duplication over premature abstraction**. If the type truly becomes shared, extract it to `src/shared/types/`.

---

## Shared Infrastructure

The `shared/` directory contains reusable **technical utilities** (not business logic).

### Database Client

**File:** `src/shared/database/client.ts`

**Purpose:** Provide simple in-memory database for the example

**Implementation:**
```typescript
interface Database {
  users: Map<string, any>
  orders: Map<string, any>
}

export const db: Database = {
  users: new Map(),
  orders: new Map()
}
```

**Characteristics:**
- **Singleton** - Single shared database instance
- **In-memory** - No persistence (resets on restart)
- **Generic** - Not specific to any feature
- **Swappable** - Could be replaced with real database without changing features

**Stricture Rules:**
- Shared can import external packages (e.g., `pg`, `mongodb`)
- Shared cannot import from features
- Features can import from shared

### Email Validation

**File:** `src/shared/validation/email.ts`

**Purpose:** Reusable email validation logic

**Implementation:**
```typescript
export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.')
}
```

**Why in Shared?**

- **Generic utility** - Not specific to user registration
- **Reusable** - Could be used by user-update, password-reset, etc.
- **No business logic** - Pure technical validation

**When NOT to use shared:**

❌ Don't put business logic in shared
❌ Don't create "UserService" in shared (that's business logic, belongs in features)
✅ Do put technical utilities (validation, formatting, HTTP helpers)

### HTTP Response Helpers

**File:** `src/shared/http/response.ts`

**Purpose:** Standardize HTTP responses across features

**Implementation:**
```typescript
import { Response } from 'express'

export function success(res: Response, status: number, data: any) {
  return res.status(status).json({ success: true, data })
}

export function error(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, error: message })
}
```

**Benefits:**
- **Consistency** - All endpoints return same response format
- **Reusability** - Every feature can use these helpers
- **Centralized changes** - Modify response format in one place

---

## Stricture Configuration

**File:** `.stricture/config.json`

### Boundaries

Each feature and the shared directory are defined as separate boundaries:

```json
{
  "boundaries": [
    {
      "name": "user-registration",
      "pattern": "src/features/user-registration/**",
      "mode": "file",
      "tags": ["feature", "user-feature"]
    },
    {
      "name": "user-profile",
      "pattern": "src/features/user-profile/**",
      "mode": "file",
      "tags": ["feature", "user-feature"]
    },
    {
      "name": "order-creation",
      "pattern": "src/features/order-creation/**",
      "mode": "file",
      "tags": ["feature", "order-feature"]
    },
    {
      "name": "order-history",
      "pattern": "src/features/order-history/**",
      "mode": "file",
      "tags": ["feature", "order-feature"]
    },
    {
      "name": "shared",
      "pattern": "src/shared/**",
      "mode": "file",
      "tags": ["shared", "infrastructure"]
    }
  ]
}
```

**Tag Strategy:**

- `"feature"` - All features have this tag (allows generic feature rules)
- `"user-feature"` - User-related features (allows self-imports within user domain)
- `"order-feature"` - Order-related features (allows self-imports within order domain)
- `"shared"` - Shared infrastructure
- `"infrastructure"` - Alternative name for shared utilities

**Why multiple tags?**

- Allows flexible rules at different levels of granularity
- Can create rules for all features (`tag: "feature"`)
- Can create rules for specific feature groups (`tag: "user-feature"`)

### Rules

```json
{
  "rules": [
    {
      "id": "feature-to-shared",
      "from": { "tag": "feature" },
      "to": { "tag": "shared" },
      "allowed": true
    },
    {
      "id": "feature-to-external",
      "from": { "tag": "feature" },
      "to": { "tag": "external" },
      "allowed": true
    },
    {
      "id": "user-feature-self-imports",
      "from": { "tag": "user-feature" },
      "to": { "tag": "user-feature" },
      "allowed": true
    },
    {
      "id": "order-feature-self-imports",
      "from": { "tag": "order-feature" },
      "to": { "tag": "order-feature" },
      "allowed": true
    },
    {
      "id": "shared-to-external",
      "from": { "tag": "shared" },
      "to": { "tag": "external" },
      "allowed": true
    },
    {
      "id": "shared-self-imports",
      "from": { "tag": "shared" },
      "to": { "tag": "shared" },
      "allowed": true
    }
  ]
}
```

#### Rule Breakdown

**1. `feature-to-shared`**
- **Purpose:** Allow features to use shared infrastructure
- **Example:** `user-registration/command.ts` imports `shared/database/client`
- **Why:** Features need database, validation, HTTP utilities

**2. `feature-to-external`**
- **Purpose:** Allow features to import npm packages
- **Example:** Feature imports `express`, `zod`, etc.
- **Why:** Features may need external libraries

**3. `user-feature-self-imports`**
- **Purpose:** Allow files within user features to import each other
- **Example:** `user-registration/endpoint.ts` imports `./command`
- **Why:** Files in the same feature collaborate

**4. `order-feature-self-imports`**
- **Purpose:** Allow files within order features to import each other
- **Example:** `order-creation/endpoint.ts` imports `./command`
- **Why:** Same as user features

**5. `shared-to-external`**
- **Purpose:** Allow shared to import npm packages
- **Example:** Shared database imports `pg` or `mongodb`
- **Why:** Infrastructure needs external dependencies

**6. `shared-self-imports`**
- **Purpose:** Allow shared files to import other shared files
- **Example:** `shared/http/error.ts` imports `shared/http/response`
- **Why:** Shared utilities can build on each other

### What's NOT Allowed (Deny-by-Default)

Thanks to Stricture's deny-by-default policy, these are automatically forbidden:

❌ **Feature → Different Feature**
- `user-registration` cannot import from `order-creation`
- `order-history` cannot import from `user-profile`

❌ **Shared → Feature**
- `shared/utils` cannot import from `user-registration`
- Keeps shared generic and reusable

❌ **Feature → Specific Feature Pattern**
- No explicit deny rules needed
- Absence of allow rule = denied

### Specificity and Rule Matching

**Order of evaluation:**

1. Sort rules by specificity (pattern > tag, specific > wildcard)
2. Evaluate each rule in order
3. First matching rule wins
4. If no rule matches → DENY (deny-by-default)

**Example:**

```typescript
// src/features/user-registration/command.ts
import { db } from '../../shared/database/client'  // ✅ Matches "feature-to-shared"
import { createOrder } from '../../order-creation/command'  // ❌ No matching rule → DENIED
```

---

## Testing Strategy

### Unit Testing Features

Each feature can be tested independently:

**Example:** Testing `registerUser` command

```typescript
// tests/user-registration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { registerUser } from '../src/features/user-registration/command'
import { db } from '../src/shared/database/client'

describe('User Registration', () => {
  beforeEach(() => {
    // Clear database before each test
    db.users.clear()
  })

  it('should create a user with valid input', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }

    const user = await registerUser(input)

    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@example.com')
    expect(user.id).toMatch(/^user_/)
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it('should persist user to database', async () => {
    const input = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456'
    }

    const user = await registerUser(input)

    const retrieved = db.users.get(user.id)
    expect(retrieved).toEqual(user)
  })
})
```

**Benefits:**
- **Isolated** - Test doesn't depend on other features
- **Fast** - No HTTP server, no real database
- **Focused** - Tests one feature's business logic

### Integration Testing Features

Test the HTTP endpoint with real Express:

```typescript
// tests/user-registration-api.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../index'

describe('POST /api/users/register', () => {
  it('should return 201 for valid registration', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password789'
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user.name).toBe('Alice Johnson')
  })

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Bob Smith',
        email: 'invalid-email',
        password: 'password123'
      })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.error).toContain('email')
  })
})
```

### Testing Stricture Boundaries

Verify that architectural violations are caught:

```typescript
// tests/stricture-boundaries.test.ts
import { describe, it } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

describe('Stricture Boundary Enforcement', () => {
  it('should prevent feature-to-feature imports', async () => {
    // This test would need to temporarily create a violation
    // and verify that `npm run lint` catches it
    // For brevity, this is a conceptual example
  })
})
```

---

## Composition Root

**File:** `index.ts`

**Purpose:** Wire all features together into a single Express application

**Implementation:**
```typescript
import express from 'express'
import { router as userRegistrationRouter } from './src/features/user-registration/endpoint.js'
import { router as userProfileRouter } from './src/features/user-profile/endpoint.js'
import { router as orderCreationRouter } from './src/features/order-creation/endpoint.js'
import { router as orderHistoryRouter } from './src/features/order-history/endpoint.js'

const app = express()
app.use(express.json())

// Mount feature routers
app.use('/api', userRegistrationRouter)
app.use('/api', userProfileRouter)
app.use('/api', orderCreationRouter)
app.use('/api', orderHistoryRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export { app }  // For testing
```

**Key Points:**

- **Only place that knows about all features** - Features don't know about each other
- **Simple routing** - Each feature provides its own router
- **Extensibility** - Adding a feature = import and mount router
- **Testability** - Exports `app` for integration tests

---

## When to Use Vertical Slice Architecture

### Use VSA When:

✅ **Feature independence** - Features have minimal shared business logic
✅ **Team autonomy** - Different teams/developers work on different features
✅ **Rapid iteration** - Need to change features quickly without touching others
✅ **Clear use cases** - Requirements are organized by user actions/workflows
✅ **Prefer simplicity** - Want minimal abstraction and clear code location

### Don't Use VSA When:

❌ **Complex domain models** - Shared entities with rich behavior (use Hexagonal/Clean)
❌ **Heavy business logic sharing** - Features share significant domain rules
❌ **DDD requirements** - Need aggregate roots, value objects, domain events
❌ **Strict layering needed** - Regulatory/security requirements for layer separation

### VSA vs Other Patterns

**VSA + Hexagonal:**
- Each feature slice can internally use hexagonal architecture
- VSA organizes features, hexagonal organizes each feature
- More complex but powerful for rich domains

**VSA + CQRS:**
- Separate command features (writes) from query features (reads)
- Natural fit - CQRS already separates concerns
- Common in event-sourced systems

**VSA + Modular Monolith:**
- Features can become modules
- Strong boundaries prepare for potential microservices extraction
- Easier to split monolith later

---

## Migration Guide

### From Layered Architecture

**Before:**
```
src/
  controllers/user-controller.ts   # All user endpoints
  services/user-service.ts          # All user logic
  repositories/user-repository.ts   # All user data
```

**After:**
```
src/
  features/
    user-registration/
      endpoint.ts    # POST /users
      command.ts     # Registration logic
    user-profile/
      endpoint.ts    # GET /users/:id
      query.ts       # Fetch logic
```

**Steps:**
1. Identify use cases in existing controllers
2. Create one feature folder per use case
3. Move related code from controller → endpoint, service → command/query
4. Extract shared utilities to `shared/`
5. Configure Stricture boundaries for each feature

### From Hexagonal Architecture

If you have a hexagonal app and want feature isolation:

1. Keep domain/ports/application layers **inside** each feature
2. Adapters become feature-specific
3. Shared infrastructure in `shared/`

**Structure:**
```
src/
  features/
    user-registration/
      domain/user.ts
      ports/user-repo.ts
      application/create-user.ts
      adapters/endpoint.ts
```

This is **Hexagonal per feature**—combines both patterns.

---

## Configuration

### TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "index.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint

**.eslintrc.js:**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@stricture'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@stricture/enforce-boundaries': 'error'
  }
}
```

### Package.json

**Scripts:**
- `build` - Compile TypeScript to JavaScript
- `dev` - Run with ts-node for development
- `lint` - Check Stricture boundaries + ESLint rules
- `type-check` - TypeScript type checking without emit
- `test` - Run Vitest tests

---

## Common Pitfalls

### 1. Putting Business Logic in Shared

❌ **Wrong:**
```typescript
// src/shared/user-service.ts
export function createUser() { /* business logic */ }
```

✅ **Right:**
```typescript
// src/features/user-registration/command.ts
export function registerUser() { /* business logic */ }
```

**Why:** Business logic is feature-specific. Shared is for technical utilities only.

### 2. Creating "Orchestrator" Features

❌ **Wrong:**
```typescript
// src/features/user-order-creation/command.ts
import { createUser } from '../../user-registration/command'  // Violation!
import { createOrder } from '../../order-creation/command'    // Violation!
```

✅ **Right:**
- Call HTTP endpoints of other features
- Use events/messaging
- Or create separate use case in composition root

### 3. Over-Abstracting Too Early

❌ **Wrong:** Extract shared interface after 2 uses

✅ **Right:** Tolerate duplication until pattern is clear (3+ uses, then extract)

**VSA Philosophy:** Prefer duplication over wrong abstraction.

### 4. Making Features Too Large

❌ **Wrong:**
```
src/features/
  user-management/  # Too broad!
    registration/
    profile/
    update/
    delete/
```

✅ **Right:**
```
src/features/
  user-registration/
  user-profile/
  user-update/
  user-deletion/
```

**Guideline:** One feature = one use case. If a feature has subdirectories, it's probably too big.

---

## Performance Considerations

### Code Duplication

**Concern:** Duplication increases bundle size.

**Reality:**
- Duplication is often minimal (types, small utilities)
- Modern bundlers (Webpack, Vite) deduplicate identical code
- Cost of wrong abstraction > cost of duplication

### Import Graph

**Benefit:** VSA creates a flat import graph (features → shared).

**Comparison:**
- Layered: Deep graph (controller → service → repository → ...)
- VSA: Shallow graph (feature → shared)

**Result:** Faster bundling, easier to tree-shake.

### Module Loading

Features are independent—enables:
- Code splitting per feature
- Lazy loading features
- Dynamic feature loading

---

## Future Enhancements

### Event-Driven Communication

Replace direct feature coupling with events:

```typescript
// src/shared/events/emitter.ts
import EventEmitter from 'events'
export const eventBus = new EventEmitter()

// src/features/user-registration/command.ts
import { eventBus } from '../../shared/events/emitter'

export async function registerUser(input: RegisterUserInput) {
  // ... create user ...
  eventBus.emit('user.registered', { userId: user.id })
  return user
}

// src/features/send-welcome-email/subscriber.ts
import { eventBus } from '../../shared/events/emitter'

eventBus.on('user.registered', async ({ userId }) => {
  // Send welcome email
})
```

### Feature Flags

Control features independently:

```typescript
// src/shared/features/flags.ts
export const features = {
  userRegistration: true,
  orderCreation: process.env.ENABLE_ORDERS === 'true'
}

// index.ts
if (features.userRegistration) {
  app.use('/api', userRegistrationRouter)
}
```

### Microservices Extraction

VSA prepares for microservices:

1. Each feature already isolated
2. Replace shared database with API calls
3. Deploy feature as separate service
4. Communication via HTTP/gRPC/events

---

## Conclusion

Vertical Slice Architecture offers a pragmatic alternative to traditional layered architectures. By organizing code by features rather than technical layers, VSA achieves:

- **High cohesion** - All code for a feature in one place
- **Low coupling** - Features isolated from each other
- **Simplicity** - Minimal abstraction, clear code location
- **Scalability** - Easy to add/remove/modify features

**Stricture's role:** Enforces feature isolation automatically, preventing accidental coupling through deny-by-default boundaries.

**When to use:** Feature-driven applications where use cases are more important than domain modeling.

**When not to use:** Complex domain logic requiring DDD, hexagonal, or clean architecture patterns.
