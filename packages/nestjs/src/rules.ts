import type { ArchRule } from '@stricture/core'

/**
 * NestJS architecture rules
 *
 * These rules enforce NestJS best practices:
 * - DTOs and Controllers cannot import Entities (use DTOs for API contracts)
 * - Controllers call Services, not Repositories (layered architecture)
 * - Controllers are independent (don't import each other)
 * - Services work with Entities and Repositories
 * - Cross-cutting concerns (guards, pipes, etc.) available everywhere
 *
 * Rules are automatically sorted by specificity - array order doesn't matter.
 * More specific rules take precedence over wildcards.
 */
export const rules: ArchRule[] = [
  // ========================================
  // CRITICAL RESTRICTIONS - DTOs and Controllers
  // ========================================

  {
    id: 'dtos-not-entities',
    name: 'DTOs Cannot Import Entities',
    description: 'DTOs define API contracts and should not depend on database entities',
    severity: 'error',
    from: { tag: 'dtos', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: false,
    message: 'DTOs should not import entities. DTOs define API contracts (input/output), while entities are internal database models. Keep them separate to allow independent evolution.',
    examples: {
      bad: [
        "import { User } from '../entities/user.entity'  // In DTO file",
        "export class CreateUserDto extends User { }  // Tight coupling!"
      ],
      good: [
        "// Define DTO independently:",
        "export class CreateUserDto {",
        "  @IsEmail()",
        "  email: string;",
        "  @IsString()",
        "  name: string;",
        "}"
      ]
    }
  },

  {
    id: 'controllers-not-entities',
    name: 'Controllers Cannot Import Entities',
    description: 'Controllers should use DTOs for API contracts, not entities',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import entities directly. Use DTOs for API input/output to avoid exposing database structure.',
    examples: {
      bad: [
        "import { User } from './entities/user.entity'  // In controller",
        "@Get()",
        "findAll(): Promise<User[]> { ... }  // Exposes entity"
      ],
      good: [
        "import { UserDto } from './dto/user.dto'",
        "@Get()",
        "findAll(): Promise<UserDto[]> { ... }  // Uses DTO"
      ]
    }
  },

  {
    id: 'controllers-not-repositories',
    name: 'Controllers Cannot Import Repositories',
    description: 'Controllers should call services, not repositories directly',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'repositories', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import repositories directly. Use services as an intermediary to keep business logic separate from HTTP handling.',
    examples: {
      bad: [
        "@Controller('users')",
        "export class UsersController {",
        "  constructor(private usersRepo: UsersRepository) { }  // Violation!"
      ],
      good: [
        "@Controller('users')",
        "export class UsersController {",
        "  constructor(private usersService: UsersService) { }  // Correct!"
      ]
    }
  },

  {
    id: 'controllers-independent',
    name: 'Controllers Are Independent',
    description: 'Controllers should not import each other',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'controllers', mode: 'file' },
    allowed: false,
    message: 'Controllers should not import each other. If you need to share logic, move it to a service and inject it into both controllers.',
    examples: {
      bad: [
        "import { UsersController } from './users.controller'  // In posts.controller"
      ],
      good: [
        "// Create a shared service instead:",
        "@Injectable()",
        "export class SharedService { ... }",
        "// Inject into both controllers"
      ]
    }
  },

  {
    id: 'repositories-not-dtos',
    name: 'Repositories Cannot Import DTOs',
    description: 'Repositories work with entities, not DTOs',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: false,
    message: 'Repositories should work with entities, not DTOs. DTOs are for API contracts, entities are for data persistence.',
    examples: {
      bad: [
        "import { CreateUserDto } from '../dto/create-user.dto'  // In repository"
      ],
      good: [
        "import { User } from '../entities/user.entity'",
        "// Repository methods use entities"
      ]
    }
  },

  {
    id: 'repositories-not-controllers',
    name: 'Repositories Cannot Import Controllers',
    description: 'Repositories are data layer, controllers are presentation',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'controllers', mode: 'file' },
    allowed: false,
    message: 'Repositories should not import controllers. This violates dependency flow. Controllers call services, services call repositories.'
  },

  // ========================================
  // ALLOWED DEPENDENCIES - Controllers
  // ========================================

  {
    id: 'controllers-to-services',
    name: 'Controllers Call Services',
    description: 'Controllers should delegate business logic to services',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'services', mode: 'file' },
    allowed: true
  },

  {
    id: 'controllers-to-dtos',
    name: 'Controllers Use DTOs',
    description: 'Controllers use DTOs for request/response',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: true
  },

  {
    id: 'controllers-external',
    name: 'Controllers Can Use External Libraries',
    description: 'Controllers can use NestJS decorators and external libraries',
    severity: 'error',
    from: { tag: 'controllers', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ========================================
  // ALLOWED DEPENDENCIES - Services
  // ========================================

  {
    id: 'services-to-entities',
    name: 'Services Can Import Entities',
    description: 'Services work with entities for business logic',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },

  {
    id: 'services-to-repositories',
    name: 'Services Use Repositories',
    description: 'Services use repositories for data access',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'repositories', mode: 'file' },
    allowed: true
  },

  {
    id: 'services-to-dtos',
    name: 'Services Can Use DTOs',
    description: 'Services can map between entities and DTOs',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: true
  },

  {
    id: 'services-to-services',
    name: 'Services Can Import Other Services',
    description: 'Services can depend on other services via DI',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'services', mode: 'file' },
    allowed: true
  },

  {
    id: 'services-external',
    name: 'Services Can Use External Libraries',
    description: 'Services can use external libraries for business logic',
    severity: 'error',
    from: { tag: 'services', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ========================================
  // ALLOWED DEPENDENCIES - Repositories
  // ========================================

  {
    id: 'repositories-to-entities',
    name: 'Repositories Work With Entities',
    description: 'Repositories persist and retrieve entities',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },

  {
    id: 'repositories-external',
    name: 'Repositories Can Use External Libraries',
    description: 'Repositories can use TypeORM, Prisma, etc.',
    severity: 'error',
    from: { tag: 'repositories', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ========================================
  // ALLOWED DEPENDENCIES - DTOs and Entities
  // ========================================

  {
    id: 'dtos-to-dtos',
    name: 'DTOs Can Import Other DTOs',
    description: 'DTOs can compose other DTOs',
    severity: 'error',
    from: { tag: 'dtos', mode: 'file' },
    to: { tag: 'dtos', mode: 'file' },
    allowed: true
  },

  {
    id: 'dtos-external',
    name: 'DTOs Can Use External Libraries',
    description: 'DTOs can use class-validator, class-transformer, etc.',
    severity: 'error',
    from: { tag: 'dtos', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'entities-to-entities',
    name: 'Entities Can Import Other Entities',
    description: 'Entities can have relationships with other entities',
    severity: 'error',
    from: { tag: 'entities', mode: 'file' },
    to: { tag: 'entities', mode: 'file' },
    allowed: true
  },

  {
    id: 'entities-external',
    name: 'Entities Can Use External Libraries',
    description: 'Entities can use TypeORM decorators, etc.',
    severity: 'error',
    from: { tag: 'entities', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  // ========================================
  // CROSS-CUTTING CONCERNS - Available Everywhere
  // ========================================

  {
    id: 'any-to-common',
    name: 'Common Is Available Everywhere',
    description: 'Any layer can import from common utilities',
    severity: 'error',
    from: { tag: '*', mode: 'file' },
    to: { tag: 'common', mode: 'file' },
    allowed: true
  },

  {
    id: 'any-to-guards',
    name: 'Guards Available Everywhere',
    description: 'Guards can be used in controllers, services, etc.',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'guards', mode: 'file' },
    allowed: true
  },

  {
    id: 'any-to-interceptors',
    name: 'Interceptors Available Everywhere',
    description: 'Interceptors can be used throughout the application',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'interceptors', mode: 'file' },
    allowed: true
  },

  {
    id: 'any-to-pipes',
    name: 'Pipes Available Everywhere',
    description: 'Pipes can be used for validation everywhere',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'pipes', mode: 'file' },
    allowed: true
  },

  {
    id: 'any-to-decorators',
    name: 'Decorators Available Everywhere',
    description: 'Custom decorators can be used throughout the application',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'decorators', mode: 'file' },
    allowed: true
  },

  {
    id: 'any-to-config',
    name: 'Config Available Everywhere',
    description: 'Configuration can be injected anywhere',
    severity: 'error',
    from: { tag: 'nestjs', mode: 'file' },
    to: { tag: 'config', mode: 'file' },
    allowed: true
  },

  // ========================================
  // SELF-IMPORTS FOR CROSS-CUTTING CONCERNS
  // ========================================

  {
    id: 'guards-self-imports',
    name: 'Guards Can Import Other Guards',
    description: 'Guards can compose other guards',
    severity: 'error',
    from: { tag: 'guards', mode: 'file' },
    to: { tag: 'guards', mode: 'file' },
    allowed: true
  },

  {
    id: 'interceptors-self-imports',
    name: 'Interceptors Can Import Other Interceptors',
    description: 'Interceptors can compose other interceptors',
    severity: 'error',
    from: { tag: 'interceptors', mode: 'file' },
    to: { tag: 'interceptors', mode: 'file' },
    allowed: true
  },

  {
    id: 'pipes-self-imports',
    name: 'Pipes Can Import Other Pipes',
    description: 'Pipes can compose other pipes',
    severity: 'error',
    from: { tag: 'pipes', mode: 'file' },
    to: { tag: 'pipes', mode: 'file' },
    allowed: true
  },

  {
    id: 'decorators-self-imports',
    name: 'Decorators Can Import Other Decorators',
    description: 'Decorators can compose other decorators',
    severity: 'error',
    from: { tag: 'decorators', mode: 'file' },
    to: { tag: 'decorators', mode: 'file' },
    allowed: true
  },

  {
    id: 'common-self-imports',
    name: 'Common Can Import Other Common',
    description: 'Common utilities can import other common utilities',
    severity: 'error',
    from: { tag: 'common', mode: 'file' },
    to: { tag: 'common', mode: 'file' },
    allowed: true
  },

  {
    id: 'config-self-imports',
    name: 'Config Can Import Other Config',
    description: 'Config modules can import other config modules',
    severity: 'error',
    from: { tag: 'config', mode: 'file' },
    to: { tag: 'config', mode: 'file' },
    allowed: true
  },

  // ========================================
  // CROSS-CUTTING TO EXTERNAL
  // ========================================

  {
    id: 'guards-external',
    name: 'Guards Can Use External Libraries',
    description: 'Guards can use passport, jwt, etc.',
    severity: 'error',
    from: { tag: 'guards', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'interceptors-external',
    name: 'Interceptors Can Use External Libraries',
    description: 'Interceptors can use external libraries',
    severity: 'error',
    from: { tag: 'interceptors', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'pipes-external',
    name: 'Pipes Can Use External Libraries',
    description: 'Pipes can use class-validator, class-transformer, etc.',
    severity: 'error',
    from: { tag: 'pipes', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'decorators-external',
    name: 'Decorators Can Use External Libraries',
    description: 'Decorators can use reflection, metadata libraries',
    severity: 'error',
    from: { tag: 'decorators', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'common-external',
    name: 'Common Can Use External Libraries',
    description: 'Common utilities can use lodash, date-fns, etc.',
    severity: 'error',
    from: { tag: 'common', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  },

  {
    id: 'config-external',
    name: 'Config Can Use External Libraries',
    description: 'Config can use @nestjs/config, dotenv, etc.',
    severity: 'error',
    from: { tag: 'config', mode: 'file' },
    to: { tag: 'external', mode: 'file' },
    allowed: true
  }
]
