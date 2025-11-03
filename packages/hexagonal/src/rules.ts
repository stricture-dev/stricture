import type { ArchRule } from '@stricture/core'

/**
 * Hexagonal architecture rules
 *
 * These rules enforce the dependency constraints of hexagonal architecture:
 * - Domain is isolated and pure (no external dependencies)
 * - Application depends on domain and ports
 * - Adapters implement ports and use application layer
 * - No direct adapter-to-domain dependencies
 *
 * NOTE: Order matters! More specific rules should come first.
 * domain-self-imports is more specific than domain-isolation.
 */
export const rules: ArchRule[] = [
  // Domain layer rules - most specific first
  {
    id: 'domain-self-imports',
    name: 'Domain Can Import Itself',
    description: 'Domain files can import other domain files',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
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
    from: { tag: 'domain', mode: 'file' },
    to: { tag: '*', mode: 'file' },
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
    from: { tag: 'ports', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true,
    message: 'Ports should reference domain types in their interfaces'
  },

  // Application layer rules
  {
    id: 'application-to-core',
    name: 'Application Uses Domain and Ports',
    description: 'Application layer orchestrates domain and ports',
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
    id: 'application-not-adapters',
    name: 'Application Isolated from Adapters',
    description: 'Application layer cannot import adapters directly',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'adapters', mode: 'file' },
    allowed: false,
    message: 'Application layer should depend on port interfaces, not concrete adapter implementations. This allows flexibility and testability.',
    examples: {
      bad: [
        "import { PostgresRepository } from '../../adapters/database'"
      ],
      good: [
        "import { UserRepository } from '../ports/user-repository'"
      ]
    }
  },

  // Adapters layer rules
  {
    id: 'adapters-to-ports',
    name: 'Adapters Implement Ports',
    description: 'Adapters implement port interfaces',
    severity: 'error',
    from: { tag: 'adapters', mode: 'file' },
    to: { tag: 'ports', mode: 'file' },
    allowed: true
  },
  {
    id: 'adapters-to-application',
    name: 'Adapters Can Use Application',
    description: 'Adapters can invoke use cases from application layer',
    severity: 'error',
    from: { tag: 'adapters', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: true
  },
  {
    id: 'adapters-not-domain',
    name: 'Adapters Through Ports Only',
    description: 'Adapters should not import domain directly',
    severity: 'error',
    from: { tag: 'adapters', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: false,
    message: 'Adapters should depend on ports and application layer, not domain directly. This maintains proper dependency inversion.',
    examples: {
      bad: [
        "import { User } from '../../core/domain/user'"
      ],
      good: [
        "import { UserRepository } from '../../core/ports/user-repository'",
        "import { CreateUserUseCase } from '../../core/application/create-user'"
      ]
    }
  }
]
