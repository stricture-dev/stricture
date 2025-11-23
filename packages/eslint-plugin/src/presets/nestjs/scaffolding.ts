import type { ScaffoldingTemplate } from '@stricture/core'

/**
 * NestJS project scaffolding template
 *
 * Provides directory structure and example files for a NestJS project
 * following best practices with proper separation of concerns.
 */
export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/modules',
      description: 'Feature modules (users, posts, etc.)'
    },
    {
      path: 'src/common',
      description: 'Shared utilities and helpers'
    },
    {
      path: 'src/common/guards',
      description: 'Authorization and authentication guards'
    },
    {
      path: 'src/common/interceptors',
      description: 'Request/response transformation interceptors'
    },
    {
      path: 'src/common/pipes',
      description: 'Validation and transformation pipes'
    },
    {
      path: 'src/common/decorators',
      description: 'Custom decorators'
    },
    {
      path: 'src/common/filters',
      description: 'Exception filters'
    },
    {
      path: 'src/config',
      description: 'Configuration modules'
    }
  ],
  files: [
    {
      path: 'src/common/README.md',
      content: `# Common

Shared utilities, guards, interceptors, and pipes.

## Guidelines

- ✅ Shared across all modules
- ✅ Guards for authentication/authorization
- ✅ Interceptors for logging, transformation
- ✅ Pipes for validation
- ✅ Decorators for metadata
- ❌ No business logic
- ❌ No module-specific code
`,
      description: 'Common utilities documentation'
    },
    {
      path: 'src/modules/README.md',
      content: `# Modules

Feature modules should follow this structure:

\`\`\`
users/
├── users.controller.ts    # HTTP endpoints
├── users.service.ts       # Business logic
├── users.repository.ts    # Data access (optional)
├── users.module.ts        # Module definition
├── dto/
│   ├── create-user.dto.ts # Input DTOs
│   ├── update-user.dto.ts
│   └── user.dto.ts        # Output DTOs
└── entities/
    └── user.entity.ts     # Database entity
\`\`\`

## Guidelines

### Controllers
- ✅ Thin HTTP handlers
- ✅ Use DTOs for input/output
- ✅ Call services for business logic
- ❌ No entities in signatures
- ❌ No repositories
- ❌ No business logic

### Services
- ✅ Business logic
- ✅ Use entities internally
- ✅ Map entities to DTOs for controllers
- ✅ Call repositories for data access
- ✅ Depend on other services via DI

### DTOs
- ✅ API contracts
- ✅ Validation decorators
- ❌ No entity imports
- ❌ Keep independent from database

### Entities
- ✅ Database models
- ✅ TypeORM/Prisma decorators
- ✅ Relationships
- ❌ Not exposed in API

### Repositories (Optional)
- ✅ Data access layer
- ✅ Work with entities
- ❌ No DTOs
- ❌ No controllers
`,
      description: 'Modules structure documentation'
    }
  ]
}
