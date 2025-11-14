# Simple Next.js - Technical Specification

## Purpose

Demonstrate the `@stricture/nextjs` preset in a minimal, runnable Next.js App Router application. This example serves as both documentation and validation that the preset works correctly with real Next.js code.

## Architecture

### Boundaries

This example demonstrates all 7 boundaries defined by `@stricture/nextjs`:

1. **server-components** (`components/server/**`)
   - `todo-list.tsx` - Fetches todos directly from database
   - `stats.tsx` - Calculates statistics server-side

2. **client-components** (`components/client/**`)
   - `todo-item.tsx` - Interactive todo with state and event handlers
   - `add-todo-form.tsx` - Form with client-side state

3. **app-routes** (`app/**/!(*api)/*.{ts,tsx}`)
   - `page.tsx` - Homepage that composes server and client components
   - `layout.tsx` - Root layout

4. **api-routes** (`app/api/**`)
   - `app/api/todos/route.ts` - RESTful API endpoint

5. **server-utils** (`lib/server/**`)
   - `database.ts` - In-memory database (simulates Prisma/SQL)

6. **shared-utils** (`lib/!(server)/**`)
   - `format.ts` - Pure functions for formatting

7. **server-actions** (`actions/**`)
   - `todos.ts` - Server Actions for mutations

### Data Flow

```
User Interaction (Browser)
    ↓
Client Component (todo-item.tsx)
    ↓
Server Action (actions/todos.ts)
    ↓
Server Utility (lib/server/database.ts)
    ↓
Data Mutation + Revalidation
    ↓
Server Component Re-renders (todo-list.tsx)
    ↓
Updated UI (Browser)
```

## Rules Enforced

### Critical Restrictions

1. **client-no-server-utils**
   - Client Components CANNOT import from `lib/server/**`
   - Verified by: Try importing `db` in `todo-item.tsx` → ESLint error

2. **client-no-api**
   - Client Components CANNOT import API route handlers
   - Verified by: Try importing `GET` from `route.ts` → ESLint error

3. **api-no-components**
   - API routes CANNOT import UI components
   - Verified by: Try importing `TodoItem` in `route.ts` → ESLint error

### Allowed Patterns

All other combinations are allowed and demonstrated:

- ✅ Server Components → Server Utils
- ✅ Server Components → Client Components
- ✅ Client Components → Server Actions
- ✅ API Routes → Server Utils
- ✅ Everyone → Shared Utils
- ✅ Everyone → External packages

## Implementation Details

### Zero Configuration

The only required file is `.stricture/config.json`:

```json
{
  "preset": "@stricture/nextjs"
}
```

No boundary overrides, no custom rules. The preset handles everything.

### Composition Root Pattern

While Next.js doesn't have a traditional composition root (it's built into the framework), the pattern is demonstrated in:

- `app/page.tsx` - Composes Server and Client Components
- Server Actions handle dependency injection implicitly

### Testing Strategy

Manual testing via ESLint:

1. Run `pnpm lint` - Should pass
2. Add a violation (e.g., import `db` in a Client Component)
3. Run `pnpm lint` - Should fail with clear error message
4. Remove violation
5. Run `pnpm lint` - Should pass again

## Build & Run

```bash
# Development
pnpm install
pnpm dev

# Production build
pnpm build
pnpm start

# Linting (includes Stricture checks)
pnpm lint

# Type checking
pnpm type-check
```

## Future Enhancements

- Middleware boundary example
- Route groups with separate boundaries
- Parallel routes
- Intercepting routes
- Dynamic segment boundaries

## Dependencies

- **next** ^14.2.0 - App Router
- **react** ^18.3.0
- **@stricture/nextjs** workspace:* - Architecture preset
- **tailwindcss** - Styling (minimal usage)

## Success Criteria

This example succeeds if:

1. ✅ All `pnpm lint` checks pass
2. ✅ Application runs without errors
3. ✅ All boundaries are clearly demonstrated
4. ✅ Violations are properly caught by ESLint
5. ✅ README is clear and educational
6. ✅ Code is copy-pasteable for learning
