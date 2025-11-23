import type { ArchRule } from '@stricture/core'

export const rules: ArchRule[] = [
  // ============================================================================
  // Type Definitions (Highest Specificity)
  // ============================================================================
  {
    id: 'types-external-allowed',
    name: 'TypeScript Type Definitions Allowed',
    description: 'All layers can use TypeScript type definitions from @types',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { pattern: 'node_modules/@types/**', mode: 'file' },
    allowed: true
  },

  // ============================================================================
  // Presentation Layer (Layer 0 - Top)
  // ============================================================================
  {
    id: 'presentation-self-imports',
    name: 'Presentation Can Import Itself',
    description: 'Files in presentation layer can import other presentation files',
    severity: 'error',
    from: { tag: 'presentation', mode: 'file' },
    to: { tag: 'presentation', mode: 'file' },
    allowed: true
  },
  {
    id: 'presentation-to-application',
    name: 'Presentation Can Use Application',
    description: 'Presentation layer can depend on application layer',
    severity: 'error',
    from: { tag: 'presentation', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: true
  },
  {
    id: 'presentation-to-domain',
    name: 'Presentation Can Use Domain',
    description: 'Presentation layer can depend on domain layer',
    severity: 'error',
    from: { tag: 'presentation', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'presentation-to-infrastructure',
    name: 'Presentation Can Use Infrastructure',
    description: 'Presentation layer can depend on infrastructure for dependency injection',
    severity: 'error',
    from: { tag: 'presentation', mode: 'file' },
    to: { tag: 'infrastructure', mode: 'file' },
    allowed: true
  },
  {
    id: 'presentation-external',
    name: 'Presentation Can Use External Libraries',
    description: 'Presentation layer can use external UI frameworks and libraries',
    severity: 'error',
    from: { tag: 'presentation', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ============================================================================
  // Application Layer (Layer 1)
  // ============================================================================
  {
    id: 'application-self-imports',
    name: 'Application Can Import Itself',
    description: 'Files in application layer can import other application files',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-to-domain',
    name: 'Application Can Use Domain',
    description: 'Application layer can depend on domain layer',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-to-infrastructure',
    name: 'Application Can Use Infrastructure',
    description: 'Application layer can depend on infrastructure interfaces',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'infrastructure', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-external',
    name: 'Application Can Use External Libraries',
    description: 'Application layer can use external utility libraries',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'application-not-presentation',
    name: 'Application Cannot Depend on Presentation',
    description: 'Application layer must not import from presentation layer',
    severity: 'error',
    from: { tag: 'application', mode: 'file' },
    to: { tag: 'presentation', mode: 'file' },
    allowed: false,
    message:
      'Application layer cannot depend on presentation layer. In layered architecture, dependencies flow top-to-bottom only. Application provides services that presentation layer calls, not the other way around.',
    examples: {
      bad: [
        "import { UserController } from '../presentation/user-controller'",
        "import { routes } from '../presentation/routes'"
      ],
      good: [
        '// Presentation layer calls Application:',
        "// presentation/user-controller.ts",
        "import { CreateUserUseCase } from '../application/create-user'",
        '',
        '// Use dependency injection in presentation layer'
      ]
    }
  },

  // ============================================================================
  // Domain Layer (Layer 2)
  // ============================================================================
  {
    id: 'domain-self-imports',
    name: 'Domain Can Import Itself',
    description: 'Files in domain layer can import other domain files',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'domain-to-infrastructure',
    name: 'Domain Can Define Infrastructure Interfaces',
    description: 'Domain layer can define repository interfaces implemented by infrastructure',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'infrastructure', mode: 'file' },
    allowed: true
  },
  {
    id: 'domain-external',
    name: 'Domain Can Use Minimal External Dependencies',
    description: 'Domain layer can use minimal external libraries (validation, etc.)',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'domain-not-presentation',
    name: 'Domain Cannot Depend on Presentation',
    description: 'Domain layer must not import from presentation layer',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'presentation', mode: 'file' },
    allowed: false,
    message:
      'Domain layer cannot depend on presentation layer. Domain contains pure business logic and should have no knowledge of UI concerns. Dependencies flow top-to-bottom in layered architecture.',
    examples: {
      bad: [
        "import { UserController } from '../presentation/user-controller'",
        "import { viewHelpers } from '../presentation/helpers'"
      ],
      good: [
        '// Domain focuses on business logic only:',
        "export class User {",
        "  constructor(public readonly email: string) {}",
        "  isValid(): boolean { return this.email.includes('@') }",
        '}'
      ]
    }
  },
  {
    id: 'domain-not-application',
    name: 'Domain Cannot Depend on Application',
    description: 'Domain layer must not import from application layer',
    severity: 'error',
    from: { tag: 'domain', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: false,
    message:
      'Domain layer cannot depend on application layer. Domain contains core business rules that are independent of application use cases. Application orchestrates domain logic, not the other way around.',
    examples: {
      bad: [
        "import { CreateUserUseCase } from '../application/create-user'",
        "import { applicationService } from '../application/services'"
      ],
      good: [
        '// Application layer calls Domain:',
        "// application/create-user.ts",
        "import { User } from '../domain/user'",
        '',
        'export class CreateUserUseCase {',
        '  execute(email: string): User {',
        '    return new User(email)',
        '  }',
        '}'
      ]
    }
  },

  // ============================================================================
  // Infrastructure Layer (Layer 3 - Bottom)
  // ============================================================================
  {
    id: 'infrastructure-self-imports',
    name: 'Infrastructure Can Import Itself',
    description: 'Files in infrastructure layer can import other infrastructure files',
    severity: 'error',
    from: { tag: 'infrastructure', mode: 'file' },
    to: { tag: 'infrastructure', mode: 'file' },
    allowed: true
  },
  {
    id: 'infrastructure-to-domain',
    name: 'Infrastructure Can Use Domain Entities',
    description: 'Infrastructure layer can import domain entities for repository implementations',
    severity: 'error',
    from: { tag: 'infrastructure', mode: 'file' },
    to: { tag: 'domain', mode: 'file' },
    allowed: true
  },
  {
    id: 'infrastructure-external',
    name: 'Infrastructure Can Use External Libraries',
    description: 'Infrastructure layer can use external data libraries, database drivers, etc.',
    severity: 'error',
    from: { tag: 'infrastructure', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },
  {
    id: 'infrastructure-not-presentation',
    name: 'Infrastructure Cannot Depend on Presentation',
    description: 'Infrastructure layer must not import from presentation layer',
    severity: 'error',
    from: { tag: 'infrastructure', mode: 'file' },
    to: { tag: 'presentation', mode: 'file' },
    allowed: false,
    message:
      'Infrastructure layer cannot depend on presentation layer. Infrastructure is the bottom layer providing data access and external system integration. It should have no knowledge of UI concerns.',
    examples: {
      bad: [
        "import { UserController } from '../presentation/user-controller'",
        "import { routes } from '../presentation/routes'"
      ],
      good: [
        '// Infrastructure implements data access:',
        "import { User } from '../domain/user'",
        '',
        'export class UserRepository {',
        '  async save(user: User): Promise<void> {',
        '    await this.db.insert("users", user)',
        '  }',
        '}'
      ]
    }
  },
  {
    id: 'infrastructure-not-application',
    name: 'Infrastructure Cannot Depend on Application',
    description: 'Infrastructure layer must not import from application layer',
    severity: 'error',
    from: { tag: 'infrastructure', mode: 'file' },
    to: { tag: 'application', mode: 'file' },
    allowed: false,
    message:
      'Infrastructure layer cannot depend on application layer. Infrastructure provides low-level data access and external system integration. Application layer orchestrates use cases using infrastructure, not the other way around.',
    examples: {
      bad: [
        "import { CreateUserUseCase } from '../application/create-user'",
        "import { applicationService } from '../application/services'"
      ],
      good: [
        '// Application layer uses Infrastructure:',
        "// application/create-user.ts",
        "import { UserRepository } from '../infrastructure/repositories/user-repository'",
        '',
        'export class CreateUserUseCase {',
        '  constructor(private userRepo: UserRepository) {}',
        '}'
      ]
    }
  }
]
