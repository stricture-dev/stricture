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
 * NOTE: Order matters! More specific rules should come first.
 */
export const rules: ArchRule[] = [
  // Domain layer rules - most specific first
  {
    id: 'domain-self-imports',
    name: 'Domain Can Import Itself',
    description: 'Domain files can import other domain files',
    severity: 'error',
    from: { mode: 'file', tag: 'domain' },
    to: { mode: 'file', tag: 'domain' },
    allowed: true,
    examples: {
      good: [
        "import { Order } from './order'",
        "import { Money } from './value-objects/money'"
      ],
      bad: []
    }
  },
  {
    id: 'domain-isolation',
    name: 'Domain Isolation',
    description: 'Domain layer must remain pure with no external dependencies',
    severity: 'error',
    from: { mode: 'file', tag: 'domain' },
    to: { mode: 'file', tag: '*' },
    allowed: false,
    message: 'Domain layer must remain pure - no dependencies on other layers or external libraries',
    examples: {
      good: [],
      bad: [
        "import { Database } from '../../adapters/database'",
        "import axios from 'axios'",
        "import { UserRepository } from '../ports/user-repository'"
      ]
    }
  },

  // Ports layer rules
  {
    id: 'ports-to-domain',
    name: 'Ports Can Reference Domain',
    description: 'Ports define interfaces using domain types',
    severity: 'error',
    from: { mode: 'file', tag: 'ports' },
    to: { mode: 'file', tag: 'domain' },
    allowed: true,
    message: 'Ports should reference domain types in their interfaces'
  },

  // Application layer rules
  {
    id: 'application-to-domain',
    name: 'Application Uses Domain',
    description: 'Application layer orchestrates domain entities',
    severity: 'error',
    from: { mode: 'file', tag: 'application' },
    to: { mode: 'file', tag: 'domain' },
    allowed: true
  },
  {
    id: 'application-to-ports',
    name: 'Application Uses Ports',
    description: 'Application layer depends on port interfaces',
    severity: 'error',
    from: { mode: 'file', tag: 'application' },
    to: { mode: 'file', tag: 'ports' },
    allowed: true
  },
  {
    id: 'application-not-adapters',
    name: 'Application Isolated from Adapters',
    description: 'Application layer cannot import adapters directly',
    severity: 'error',
    from: { mode: 'file', tag: 'application' },
    to: { mode: 'file', tag: 'adapters' },
    allowed: false,
    message: 'Application layer should depend on port interfaces, not concrete adapter implementations',
    examples: {
      bad: [
        "import { PostgresRepository } from '../../adapters/driven/postgres-repository'"
      ],
      good: [
        "import { UserRepository } from '../ports/user-repository'"
      ]
    }
  },

  // Driving adapters rules (CLI, HTTP, GraphQL, etc.) - more specific, comes first
  {
    id: 'driving-to-application',
    name: 'Driving Adapters Call Use Cases',
    description: 'Driving adapters invoke application use cases',
    severity: 'error',
    from: { mode: 'file', tag: 'driving' },
    to: { mode: 'file', tag: 'application' },
    allowed: true,
    message: 'Driving adapters (CLI, HTTP controllers) should call use cases from application layer'
  },
  {
    id: 'driving-to-ports',
    name: 'Driving Adapters Can Use Ports',
    description: 'Driving adapters can reference ports for dependency injection',
    severity: 'error',
    from: { mode: 'file', tag: 'driving' },
    to: { mode: 'file', tag: 'ports' },
    allowed: true,
    message: 'Driving adapters can import ports for wiring dependencies'
  },
  {
    id: 'driving-not-driven',
    name: 'Driving Adapters Independent',
    description: 'Driving adapters should not import driven adapters',
    severity: 'error',
    from: { mode: 'file', tag: 'driving' },
    to: { mode: 'file', tag: 'driven' },
    allowed: false,
    message: 'Driving adapters should not directly import driven adapters - use dependency injection instead',
    examples: {
      bad: [
        "import { PostgresRepository } from '../driven/postgres-repository'"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "// Inject repository through constructor"
      ]
    }
  },

  // Driven adapters rules (Repositories, External APIs, etc.) - more specific, comes first
  {
    id: 'driven-implements-ports',
    name: 'Driven Adapters Implement Ports',
    description: 'Driven adapters implement port interfaces',
    severity: 'error',
    from: { mode: 'file', tag: 'driven' },
    to: { mode: 'file', tag: 'ports' },
    allowed: true,
    message: 'Driven adapters should implement interfaces defined in ports'
  },
  {
    id: 'driven-to-domain',
    name: 'Driven Adapters Can Use Domain Types',
    description: 'Driven adapters can import domain types when implementing ports',
    severity: 'error',
    from: { mode: 'file', tag: 'driven' },
    to: { mode: 'file', tag: 'domain' },
    allowed: true,
    message: 'Driven adapters can import domain types needed to implement port interfaces'
  },
  {
    id: 'driven-not-application',
    name: 'Driven Adapters Passive',
    description: 'Driven adapters should not call application layer',
    severity: 'error',
    from: { mode: 'file', tag: 'driven' },
    to: { mode: 'file', tag: 'application' },
    allowed: false,
    message: 'Driven adapters are passive - they should not call use cases. Application calls them through ports.',
    examples: {
      bad: [
        "import { CreateUserUseCase } from '../../core/application/create-user'"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "// This adapter IMPLEMENTS the port, doesn't call the application"
      ]
    }
  },

  // General adapter rules - less specific, comes last
  {
    id: 'driving-not-domain',
    name: 'Driving Adapters Through Application',
    description: 'Driving adapters should use application layer, not domain directly',
    severity: 'error',
    from: { mode: 'file', tag: 'driving' },
    to: { mode: 'file', tag: 'domain' },
    allowed: false,
    message: 'Driving adapters should call application use cases, not import domain directly',
    examples: {
      bad: [
        "import { User } from '../../core/domain/user'"
      ],
      good: [
        "import { CreateUserUseCase } from '../../core/application/create-user'"
      ]
    }
  }
]
