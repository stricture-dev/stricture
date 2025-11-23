import type { ArchRule } from '@stricture/core'

/**
 * Clean Architecture rules
 *
 * These rules enforce the Dependency Rule of Clean Architecture:
 * all source code dependencies point INWARD toward entities.
 *
 * The four layers and their allowed dependencies:
 * - Entities (layer 0): Zero dependencies (pure business logic)
 * - Use Cases (layer 1): Can depend on entities only
 * - Interface Adapters (layer 2): Can depend on use cases and entities
 * - Frameworks & Drivers (layer 3): Can depend on everything (outermost layer)
 *
 * Rules are automatically sorted by specificity - array order doesn't matter.
 */
export const rules: ArchRule[] = [
  // ===== ENTITIES LAYER (Layer 0 - Innermost) =====

  {
    id: 'entities-self-imports',
    name: 'Entities Can Import Each Other',
    description: 'Entity objects can reference other entities',
    severity: 'error',
    from: { tag: 'entities', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },
  {
    id: 'entities-isolation',
    name: 'Entities Have Zero Outward Dependencies',
    description: 'Entities cannot depend on any outer layer',
    severity: 'error',
    from: { tag: 'entities', mode: 'file' },
    to: { tag: '*', mode: 'file' },
    allowed: false,
    message:
      'Entities (enterprise business rules) must have zero dependencies on outer layers. Keep entities pure.',
    examples: {
      bad: [
        "import { CreateOrder } from '../use-cases/create-order'",
        "import { OrderController } from '../interface-adapters/order-controller'",
        "import axios from 'axios'"
      ],
      good: [
        "import { Customer } from './customer'",
        "import { Money } from './value-objects/money'"
      ]
    }
  },

  // ===== USE CASES LAYER (Layer 1) =====

  {
    id: 'use-cases-to-entities',
    name: 'Use Cases Can Depend on Entities',
    description: 'Use cases orchestrate entities',
    severity: 'error',
    from: { tag: 'use-cases', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },
  {
    id: 'use-cases-self-imports',
    name: 'Use Cases Can Import Each Other',
    description: 'Use case interactors can call other use cases',
    severity: 'error',
    from: { tag: 'use-cases', mode: 'file' },
    to: { tag: 'use-cases', mode: 'file' },
    allowed: true
  },
  {
    id: 'use-cases-external',
    name: 'Use Cases Can Use External Libraries',
    description: 'Use cases can use utility libraries',
    severity: 'error',
    from: { tag: 'use-cases', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'use-cases-not-interface-adapters',
    name: 'Use Cases Cannot Depend on Interface Adapters',
    description: 'Use cases must not know about outer layers',
    severity: 'error',
    from: { tag: 'use-cases', mode: 'file' },
    to: { tag: 'interface-adapters', mode: 'file' },
    allowed: false,
    message:
      'Use cases cannot depend on interface adapters. Dependencies must point INWARD. Use interfaces to invert dependencies.',
    examples: {
      bad: [
        "import { OrderController } from '../interface-adapters/order-controller'",
        "import { OrderPresenter } from '../interface-adapters/order-presenter'"
      ],
      good: [
        "import { Order } from '../entities/order'",
        '// Define output port interface in use-cases layer:',
        'export interface OrderOutput { present(order: Order): void }'
      ]
    }
  },
  {
    id: 'use-cases-not-frameworks',
    name: 'Use Cases Cannot Depend on Frameworks',
    description: 'Use cases must be framework-independent',
    severity: 'error',
    from: { tag: 'use-cases', mode: 'file' },
    to: { tag: 'frameworks-drivers', mode: 'file' },
    allowed: false,
    message:
      'Use cases cannot depend on frameworks or drivers. Keep use cases pure and framework-independent.',
    examples: {
      bad: [
        "import express from 'express'",
        "import { Database } from '../frameworks-drivers/database'"
      ],
      good: [
        "import { Order } from '../entities/order'",
        '// Define gateway interface in use-cases layer:',
        'export interface OrderGateway { save(order: Order): Promise<void> }'
      ]
    }
  },

  // ===== INTERFACE ADAPTERS LAYER (Layer 2) =====

  {
    id: 'interface-adapters-to-use-cases',
    name: 'Interface Adapters Can Depend on Use Cases',
    description: 'Controllers and presenters call use cases',
    severity: 'error',
    from: { tag: 'interface-adapters', mode: 'file' },
    to: { tag: 'use-cases', mode: 'file' },
    allowed: true
  },
  {
    id: 'interface-adapters-to-entities',
    name: 'Interface Adapters Can Depend on Entities',
    description: 'Adapters can reference domain entities',
    severity: 'error',
    from: { tag: 'interface-adapters', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },
  {
    id: 'interface-adapters-self-imports',
    name: 'Interface Adapters Can Import Each Other',
    description: 'Controllers, presenters, and gateways can collaborate',
    severity: 'error',
    from: { tag: 'interface-adapters', mode: 'file' },
    to: { tag: 'interface-adapters', mode: 'file' },
    allowed: true
  },
  {
    id: 'interface-adapters-external',
    name: 'Interface Adapters Can Use External Libraries',
    description: 'Adapters can use external utilities',
    severity: 'error',
    from: { tag: 'interface-adapters', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'interface-adapters-not-frameworks',
    name: 'Interface Adapters Should Not Directly Import Frameworks',
    description: 'Keep framework details in the frameworks-drivers layer',
    severity: 'error',
    from: { tag: 'interface-adapters', mode: 'file' },
    to: { tag: 'frameworks-drivers', mode: 'file' },
    allowed: false,
    message:
      'Interface adapters should not directly depend on framework/driver implementations. Use dependency injection from the outermost layer.',
    examples: {
      bad: [
        "import { ExpressServer } from '../frameworks-drivers/express-server'",
        "import { PostgresDatabase } from '../frameworks-drivers/postgres'"
      ],
      good: [
        "// Controllers receive dependencies via constructor",
        'constructor(private createOrder: CreateOrderUseCase) {}',
        '// Gateways implement interfaces defined in use-cases',
        'export class OrderGateway implements OrderGatewayInterface {...}'
      ]
    }
  },

  // ===== FRAMEWORKS & DRIVERS LAYER (Layer 3 - Outermost) =====

  {
    id: 'frameworks-to-interface-adapters',
    name: 'Frameworks Can Depend on Interface Adapters',
    description: 'Framework layer wires up adapters',
    severity: 'error',
    from: { tag: 'frameworks-drivers', mode: 'file' },
    to: { tag: 'interface-adapters', mode: 'file' },
    allowed: true
  },
  {
    id: 'frameworks-to-use-cases',
    name: 'Frameworks Can Depend on Use Cases',
    description: 'Framework layer can directly invoke use cases',
    severity: 'error',
    from: { tag: 'frameworks-drivers', mode: 'file' },
    to: { tag: 'use-cases', mode: 'file' },
    allowed: true
  },
  {
    id: 'frameworks-to-entities',
    name: 'Frameworks Can Depend on Entities',
    description: 'Framework layer can reference entities',
    severity: 'error',
    from: { tag: 'frameworks-drivers', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },
  {
    id: 'frameworks-self-imports',
    name: 'Frameworks Can Import Each Other',
    description: 'Framework components can collaborate',
    severity: 'error',
    from: { tag: 'frameworks-drivers', mode: 'file' },
    to: { tag: 'frameworks-drivers', mode: 'file' },
    allowed: true
  },
  {
    id: 'frameworks-external',
    name: 'Frameworks Can Use External Libraries',
    description: 'This layer contains framework-specific code',
    severity: 'error',
    from: { tag: 'frameworks-drivers', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  }
]
