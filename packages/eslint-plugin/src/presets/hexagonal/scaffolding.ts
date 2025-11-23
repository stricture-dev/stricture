import type { ScaffoldingTemplate } from '@stricture/core'

/**
 * Hexagonal architecture scaffolding template
 *
 * Provides directory structure and example files for setting up
 * a hexagonal architecture project.
 */
export const scaffolding: ScaffoldingTemplate = {
  directories: [
    {
      path: 'src/core/domain',
      description: 'Domain entities, value objects, and business logic'
    },
    {
      path: 'src/core/domain/entities',
      description: 'Domain entities with identity'
    },
    {
      path: 'src/core/domain/value-objects',
      description: 'Immutable value objects'
    },
    {
      path: 'src/core/ports',
      description: 'Port interfaces for external dependencies'
    },
    {
      path: 'src/core/application',
      description: 'Use cases and application services'
    },
    {
      path: 'src/adapters/driving',
      description: 'Primary adapters - entry points (CLI, HTTP, GraphQL)'
    },
    {
      path: 'src/adapters/driving/api',
      description: 'HTTP/REST API controllers'
    },
    {
      path: 'src/adapters/driving/cli',
      description: 'Command-line interfaces'
    },
    {
      path: 'src/adapters/driven',
      description: 'Secondary adapters - implementations (Repositories, APIs)'
    },
    {
      path: 'src/adapters/driven/database',
      description: 'Database adapters and repositories'
    },
    {
      path: 'src/adapters/driven/messaging',
      description: 'Message queue adapters'
    }
  ],
  files: [
    {
      path: 'src/core/domain/README.md',
      content: `# Domain Layer

Pure business logic with no external dependencies.

## Guidelines

- ✅ Entities and value objects
- ✅ Domain services
- ✅ Business rules and validations
- ❌ No infrastructure code
- ❌ No external dependencies
- ❌ No framework code
`,
      description: 'Domain layer documentation'
    },
    {
      path: 'src/core/ports/README.md',
      content: `# Ports (Interfaces)

Interface definitions for external interactions.

## Guidelines

- ✅ Define interfaces using domain types
- ✅ Keep interfaces focused (ISP)
- ✅ Repository interfaces
- ✅ Service interfaces
- ❌ No implementations here
`,
      description: 'Ports documentation'
    },
    {
      path: 'src/core/application/README.md',
      content: `# Application Layer

Use cases that orchestrate domain and ports.

## Guidelines

- ✅ Use cases (commands/queries)
- ✅ Application services
- ✅ Orchestration logic
- ✅ Depend on ports, not adapters
- ❌ No infrastructure details
`,
      description: 'Application layer documentation'
    },
    {
      path: 'src/adapters/driving/README.md',
      content: `# Driving Adapters (Primary/Active)

Entry points that receive input from the outside world and call the application.

## Examples
- CLI commands
- HTTP/REST controllers
- GraphQL resolvers
- Message consumers
- Scheduled jobs

## Guidelines

- ✅ Call use cases from application layer
- ✅ Can use ports for dependency injection
- ✅ Convert external formats to domain types
- ❌ No business logic
- ❌ Cannot import driven adapters directly
- ❌ Cannot import domain directly
`,
      description: 'Driving adapters documentation'
    },
    {
      path: 'src/adapters/driven/README.md',
      content: `# Driven Adapters (Secondary/Passive)

Implementations of port interfaces that the application calls.

## Examples
- Database repositories
- File storage
- External API clients
- Email services
- Cache implementations

## Guidelines

- ✅ Implement port interfaces
- ✅ Can use domain types (needed for ports)
- ✅ Framework-specific code here
- ❌ No business logic
- ❌ Cannot call use cases (passive role)
`,
      description: 'Driven adapters documentation'
    }
  ]
}
