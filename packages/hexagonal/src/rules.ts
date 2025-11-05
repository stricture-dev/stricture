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
 * With deny-by-default policy, we only need to define:
 * 1. Critical restrictions with helpful messages (allowed: false)
 * 2. Explicit allowances (allowed: true)
 */
export const rules: ArchRule[] = [
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
    id: 'adapters-not-domain',
    name: 'Adapters Through Ports Only',
    description: 'Adapters should not import domain directly',
    severity: 'error',
    from: { tag: 'adapters', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: false,
    message: 'Adapters should depend on ports and application layer, not domain directly',
    examples: {
      bad: [
        "import { User } from '../../core/domain/user'"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "import { CreateUserUseCase } from '../../core/application/create-user'"
      ]
    }
  },

  // Allowed imports (all allowed:true)
  {
    id: 'domain-self-imports',
    name: 'Domain Can Import Itself',
    description: 'Domain files can import other domain files',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
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
    id: 'driven-to-ports',
    name: 'Driven Adapters Implement Ports',
    description: 'Driven adapters implement port interfaces',
    severity: 'error',
    from: { tag: 'driven', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
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
