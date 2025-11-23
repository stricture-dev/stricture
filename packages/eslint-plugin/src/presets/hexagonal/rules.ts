import type { ArchRule } from '@stricture/core'

/**
 * Hexagonal architecture rules
 *
 * These rules enforce the dependency constraints of hexagonal architecture:
 * - Domain is isolated and pure (no external dependencies)
 * - Application depends on domain and ports
 * - Driving adapters call application, driven adapters implement ports
 * - Proper separation between driving and driven adapters
 *
 * Rules are automatically sorted by specificity - array order doesn't matter.
 * More specific rules (domain → domain) take precedence over wildcards (domain → *).
 * Specificity is calculated based on pattern/tag specificity in validate-import.ts.
 */
export const rules: ArchRule[] = [
  {
    id: 'domain-self-imports',
    name: 'Domain Can Import Itself',
    description: 'Domain files can import other domain files',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },

  // Critical restrictions with helpful messages
  {
    id: 'domain-isolation',
    name: 'Domain Isolation',
    description: 'Domain layer must remain pure with no external dependencies',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: '*', mode: 'file' },
    allowed: false,
    message: 'Domain layer must remain pure - no dependencies on other layers or external libraries',
    examples: {
      bad: [
        "import { Database } from '../../adapters/database'",
        "import axios from 'axios'",
        "import { UserRepository } from '../ports/user-repository'"
      ],
      good: [
        "import { Order } from './order'",
        "import { Money } from './value-objects/money'"
      ]
    }
  },
  {
    id: 'driving-not-driven',
    name: 'Driving Adapters Independent from Driven',
    description: 'Driving adapters should not import driven adapters directly',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'driven', mode: 'file' },
    allowed: false,
    message: 'Driving adapters should not directly import driven adapters. Use dependency injection via composition root.',
    examples: {
      bad: [
        "import { PostgresRepository } from '../driven/postgres-repository'"
      ],
      good: [
        "// In index.ts (composition root):",
        "const repo = new PostgresRepository()",
        "const useCase = new CreateUserUseCase(repo)",
        "const cli = new CLI(useCase)"
      ]
    }
  },
  {
    id: 'application-not-adapters',
    name: 'Application Isolated from Adapters',
    description: 'Application layer cannot import adapters directly',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'adapters', mode: 'file' },
    allowed: false,
    message: 'Application layer should depend on port interfaces, not concrete adapter implementations',
    examples: {
      bad: [
        "import { PostgresRepository } from '../../adapters/driven/postgres-repository'"
      ],
      good: [
        "import { UserRepository } from '../ports/user-repository'",
        "// Inject concrete implementation from composition root"
      ]
    }
  },
  {
    id: 'driving-not-domain',
    name: 'Driving Adapters Isolated from Domain',
    description: 'Driving adapters should not import domain directly',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: false,
    message: 'Driving adapters (CLI, HTTP) should call the application layer, not domain directly',
    examples: {
      bad: [
        "import { User } from '../../core/domain/user'  // In CLI adapter"
      ],
      good: [
        "import { CreateUserUseCase } from '../../core/application/create-user'",
        "// CLI calls use cases, not domain entities"
      ]
    }
  },
  {
    id: 'driven-not-application',
    name: 'Driven Adapters Cannot Call Use Cases',
    description: 'Driven adapters are passive and cannot call application use cases',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: false,
    message: 'Driven adapters (repositories, external APIs) are passive. They cannot call use cases.',
    examples: {
      bad: [
        "import { CreateUserUseCase } from '../../core/application/create-user'  // In repository"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "// Repositories implement ports, they don't call use cases"
      ]
    }
  },
  {
    id: 'driving-independent',
    name: 'Driving Adapters Are Independent',
    description: 'Driving adapters should not import each other',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'driving', mode: 'file' },
    allowed: false,
    message: 'Driving adapters (CLI, HTTP, GraphQL) should be independent entry points. They should not import each other.',
    examples: {
      bad: [
        "import { CLI } from './cli'  // In http-controller.ts",
        "import { HTTPController } from './http-controller'  // In graphql-resolver.ts"
      ],
      good: [
        "// Each driving adapter is completely independent",
        "// They share nothing except calling the same use cases"
      ]
    }
  },
  {
    id: 'driven-independent',
    name: 'Driven Adapters Are Independent',
    description: 'Driven adapters should not import each other',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'driven', mode: 'file' },
    allowed: false,
    message: 'Driven adapters (repositories, API clients) should be independent. If they share logic, create a shared port or helper.',
    examples: {
      bad: [
        "import { PostgresRepository } from './postgres-repository'  // In mongo-repository.ts",
        "import { DatabaseConnection } from './database-adapter'  // In cache-adapter.ts"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "// Both PostgresRepository and MongoRepository implement the same port independently"
      ]
    }
  },
  {
    id: 'driven-not-driving',
    name: 'Driven Adapters Cannot Import Driving Adapters',
    description: 'Driven adapters are passive and should not know about entry points',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'driving', mode: 'file' },
    allowed: false,
    message: 'Driven adapters (repositories) should not import driving adapters (CLI, HTTP). This inverts the dependency flow.',
    examples: {
      bad: [
        "import { CLI } from '../../driving/cli'  // In repository"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "// Driven adapters only implement ports"
      ]
    }
  },

  // Allowed imports (all allowed:true)
  {
    id: 'ports-to-domain',
    name: 'Ports Can Reference Domain',
    description: 'Ports define interfaces using domain types',
    severity: 'error',
    from: { tag: 'ports', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'ports-self-imports',
    name: 'Ports Can Import Each Other',
    description: 'Port interfaces can reference other port interfaces',
    severity: 'error',
    from: { tag: 'ports', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
    allowed: true
  },
  {
    id: 'ports-external',
    name: 'Ports Can Use External Types',
    description: 'Port interfaces may use external types in signatures',
    severity: 'error',
    from: { tag: 'ports', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-to-domain',
    name: 'Application Uses Domain',
    description: 'Application layer orchestrates domain entities',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-to-ports',
    name: 'Application Uses Ports',
    description: 'Application layer depends on port interfaces',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-self-imports',
    name: 'Application Can Import Itself',
    description: 'Use cases can import other use cases',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-external',
    name: 'Application Can Use External Libraries',
    description: 'Use cases can use external utilities',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'driving-to-application',
    name: 'Driving Adapters Call Use Cases',
    description: 'Driving adapters invoke application use cases',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: true
  },
  {
    id: 'driving-to-ports',
    name: 'Driving Adapters Can Use Ports',
    description: 'Driving adapters can reference ports for dependency injection',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
    allowed: true
  },
  {
    id: 'driving-external',
    name: 'Driving Adapters Can Use Frameworks',
    description: 'Driving adapters can use external frameworks',
    severity: 'error',
    from: { tag: 'driving', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'driven-implements-ports',
    name: 'Driven Adapters Implement Ports',
    description: 'Driven adapters implement port interfaces',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
    allowed: true
  },
  {
    id: 'driven-to-domain',
    name: 'Driven Adapters Can Import Domain Types',
    description: 'Driven adapters can import domain types used in ports they implement',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'driven-external',
    name: 'Driven Adapters Can Use External Libraries',
    description: 'Driven adapters can use databases, APIs, etc.',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  }
]
