# NestJS Layered Architecture Example - Technical Specification

## Overview

A REST API for task management built with NestJS demonstrating strict layered architecture enforced by Stricture's `@stricture/nestjs` preset.

## Purpose

This example demonstrates how to:
- Build a production-ready NestJS application with proper layering
- Use Stricture to enforce NestJS architectural best practices
- Separate API contracts (DTOs) from database models (Entities)
- Implement proper dependency injection and module organization
- Structure code following NestJS conventions

## Architecture Pattern

**NestJS Layered Architecture** with the following boundaries:

```
Controllers (Presentation Layer)
    ↓
Services (Business Logic Layer)
    ↓
Repositories (Data Access Layer)
    ↓
Entities (Domain Models)
```

**Cross-cutting concerns**: DTOs, Guards, Pipes, Interceptors, Decorators, Config, Common utilities

## Stricture Preset

**Preset**: `@stricture/nestjs`

**Configuration**: `.stricture/config.json`
```json
{
  "preset": "@stricture/nestjs"
}
```

This preset enforces:
- ✅ Controllers call Services (not Repositories directly)
- ✅ Controllers use DTOs (not Entities) for request/response
- ✅ DTOs are independent of Entities (API/DB separation)
- ✅ Controllers are independent (no cross-controller dependencies)
- ✅ Services use Repositories and Entities
- ✅ Modules wire dependencies
- ✅ Cross-cutting concerns (guards, pipes, etc.) available everywhere

## Features

### 1. Task Management

**Entities**:
- `Task` - Task domain model with fields: id, title, description, status, priority, createdAt, updatedAt

**DTOs**:
- `CreateTaskDto` - Input for creating tasks
- `UpdateTaskDto` - Input for updating tasks
- `TaskDto` - Output representation of tasks
- `TaskListDto` - Output for task lists with metadata

**Endpoints**:
- `GET /tasks` - List all tasks (with optional status filter)
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/complete` - Mark task as complete

**Business Rules** (in TasksService):
- Task title must not be empty
- Task priority must be valid (low, medium, high)
- Cannot complete already completed tasks
- Cannot delete tasks that don't exist

## Technical Implementation

### File Structure

```
src/
├── main.ts                          # Bootstrap and composition root
├── app.module.ts                    # Root module
├── tasks/
│   ├── tasks.module.ts              # Tasks module (DI configuration)
│   ├── tasks.controller.ts          # HTTP endpoints
│   ├── tasks.service.ts             # Business logic
│   ├── tasks.repository.ts          # Data access (in-memory)
│   ├── dto/
│   │   ├── create-task.dto.ts       # Input DTO for creation
│   │   ├── update-task.dto.ts       # Input DTO for updates
│   │   └── task.dto.ts              # Output DTO
│   └── entities/
│       └── task.entity.ts           # Domain model
└── common/
    └── types.ts                     # Shared types (Priority, TaskStatus)
```

### Layer Responsibilities

#### Controllers (`*.controller.ts`)
- Handle HTTP requests and responses
- Validate input using DTOs with class-validator
- Call services for business logic
- Transform service results to DTOs for responses
- Apply guards, pipes, interceptors

**Dependencies**:
- ✅ Services
- ✅ DTOs
- ✅ External libraries (NestJS decorators)
- ❌ NOT Entities
- ❌ NOT Repositories
- ❌ NOT other Controllers

#### Services (`*.service.ts`)
- Implement business logic and rules
- Orchestrate use cases
- Work with Entities and Repositories
- Map between DTOs and Entities
- Throw domain exceptions

**Dependencies**:
- ✅ Repositories
- ✅ Entities
- ✅ DTOs (for mapping)
- ✅ Other Services
- ✅ External libraries
- ❌ NOT Controllers

#### Repositories (`*.repository.ts`)
- Encapsulate data access logic
- Work with Entities only
- Provide CRUD operations
- In this example: In-memory storage

**Dependencies**:
- ✅ Entities
- ✅ External libraries (TypeORM, Prisma, etc.)
- ❌ NOT DTOs
- ❌ NOT Controllers
- ❌ NOT Services

#### Entities (`entities/*.entity.ts`)
- Define domain models
- Contain entity metadata (for ORMs)
- Can have relationships with other entities
- Pure data structures (in this example)

**Dependencies**:
- ✅ Other Entities (relationships)
- ✅ External libraries (ORM decorators)
- ❌ NOT DTOs
- ❌ NOT Controllers
- ❌ NOT Services

#### DTOs (`dto/*.dto.ts`)
- Define API contracts (input/output shapes)
- Include validation decorators (class-validator)
- Document API structure
- Independent of database models

**Dependencies**:
- ✅ Other DTOs (composition)
- ✅ External libraries (class-validator, class-transformer)
- ❌ NOT Entities (critical!)
- ❌ NOT Controllers
- ❌ NOT Services

#### Modules (`*.module.ts`)
- Wire dependencies via DI
- Can import from any layer
- Export providers for other modules
- Configure module metadata

**Dependencies**:
- ✅ All layers (wiring purposes)

### Data Models

#### Task Entity

```typescript
export class Task {
  id: string
  title: string
  description: string
  status: TaskStatus  // 'todo' | 'in_progress' | 'done'
  priority: Priority  // 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}
```

#### Task DTOs

```typescript
// Input DTO
export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(Priority)
  priority: Priority
}

// Output DTO
export class TaskDto {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string  // ISO string for API
  updatedAt: string  // ISO string for API
}
```

**Note**: Entity has `Date` objects, DTO has ISO strings. This separation allows:
- API contract stability (changing Entity doesn't break API)
- Different representations (e.g., Date vs string)
- Clean API documentation

### Business Logic Examples

#### Creating a Task

```typescript
// TasksService
async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
  // Create entity from DTO
  const task: Task = {
    id: generateId(),
    title: createTaskDto.title,
    description: createTaskDto.description || '',
    status: TaskStatus.TODO,
    priority: createTaskDto.priority,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Business rule validation
  if (!task.title.trim()) {
    throw new BadRequestException('Title cannot be empty')
  }

  // Persist via repository
  await this.tasksRepository.save(task)

  // Map entity to DTO for response
  return this.entityToDto(task)
}
```

#### Completing a Task

```typescript
// TasksService
async complete(id: string): Promise<TaskDto> {
  const task = await this.tasksRepository.findById(id)

  if (!task) {
    throw new NotFoundException(`Task ${id} not found`)
  }

  // Business rule
  if (task.status === TaskStatus.DONE) {
    throw new BadRequestException('Task is already completed')
  }

  // Update entity
  task.status = TaskStatus.DONE
  task.updatedAt = new Date()

  // Persist changes
  await this.tasksRepository.update(task)

  // Return DTO
  return this.entityToDto(task)
}
```

### Dependency Injection

#### Module Configuration

```typescript
@Module({
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],  // Available to other modules
})
export class TasksModule {}
```

#### Service Injection

```typescript
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  // Service injected by NestJS DI container
}
```

## Testing Strategy

### Unit Tests

**Services** (`tasks.service.spec.ts`):
- Test business logic in isolation
- Mock repositories
- Verify business rules enforcement
- Test error handling

```typescript
describe('TasksService', () => {
  it('should create a task', async () => {
    const mockRepo = { save: jest.fn() }
    const service = new TasksService(mockRepo)

    await service.create({ title: 'Test', priority: Priority.HIGH })

    expect(mockRepo.save).toHaveBeenCalled()
  })

  it('should reject empty title', async () => {
    const mockRepo = { save: jest.fn() }
    const service = new TasksService(mockRepo)

    await expect(
      service.create({ title: '', priority: Priority.LOW })
    ).rejects.toThrow('Title cannot be empty')
  })
})
```

**Repositories** (`tasks.repository.spec.ts`):
- Test CRUD operations
- Verify data integrity
- Test edge cases

### Integration Tests

**Controllers** (`tasks.controller.spec.ts`):
- Test HTTP layer with TestingModule
- Mock services
- Verify request/response transformation
- Test validation

```typescript
describe('TasksController', () => {
  let controller: TasksController
  let service: TasksService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: { create: jest.fn(), findAll: jest.fn() },
        },
      ],
    }).compile()

    controller = module.get(TasksController)
    service = module.get(TasksService)
  })

  it('should create task via controller', async () => {
    const dto = { title: 'Test', priority: Priority.HIGH }
    jest.spyOn(service, 'create').mockResolvedValue({ id: '1', ...dto })

    const result = await controller.create(dto)

    expect(result.id).toBe('1')
    expect(service.create).toHaveBeenCalledWith(dto)
  })
})
```

### E2E Tests

**Full API flows** (`test/tasks.e2e-spec.ts`):
- Test complete request/response cycles
- Use real HTTP requests
- Test with actual database (or in-memory)
- Verify status codes, headers, bodies

```typescript
describe('Tasks API (e2e)', () => {
  it('GET /tasks should return empty array initially', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect([])
  })

  it('POST /tasks should create task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test Task', priority: 'high' })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined()
        expect(res.body.title).toBe('Test Task')
      })
  })
})
```

## Stricture Violations Examples

### ❌ Controller Importing Entity (Forbidden)

```typescript
// tasks.controller.ts
import { Task } from './entities/task.entity'  // ❌ VIOLATION

@Controller('tasks')
export class TasksController {
  @Get()
  async findAll(): Promise<Task[]> {  // Exposing entity!
    return this.tasksService.findAll()
  }
}
```

**Stricture Error:**
```
Controllers should not import entities directly. Use DTOs for API input/output
to avoid exposing database structure.
```

**Fix:**
```typescript
// tasks.controller.ts
import { TaskDto } from './dto/task.dto'  // ✅ CORRECT

@Controller('tasks')
export class TasksController {
  @Get()
  async findAll(): Promise<TaskDto[]> {  // Using DTO!
    return this.tasksService.findAll()
  }
}
```

### ❌ DTO Importing Entity (Forbidden)

```typescript
// dto/create-task.dto.ts
import { Task } from '../entities/task.entity'  // ❌ VIOLATION

export class CreateTaskDto extends Task {  // Tight coupling!
  // ...
}
```

**Stricture Error:**
```
DTOs should not import entities. DTOs define API contracts (input/output),
while entities are internal database models. Keep them separate to allow
independent evolution.
```

**Fix:**
```typescript
// dto/create-task.dto.ts
// No entity import! ✅ CORRECT

export class CreateTaskDto {
  @IsNotEmpty()
  title: string

  @IsOptional()
  description?: string

  @IsEnum(Priority)
  priority: Priority
}
```

### ❌ Controller Importing Repository (Forbidden)

```typescript
// tasks.controller.ts
import { TasksRepository } from './tasks.repository'  // ❌ VIOLATION

@Controller('tasks')
export class TasksController {
  constructor(private tasksRepo: TasksRepository) {}  // Skipping service layer!
}
```

**Stricture Error:**
```
Controllers should not import repositories directly. Use services as an
intermediary to keep business logic separate from HTTP handling.
```

**Fix:**
```typescript
// tasks.controller.ts
import { TasksService } from './tasks.service'  // ✅ CORRECT

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
}
```

## Quality Standards

### TypeScript Configuration

- Strict mode enabled
- No unchecked indexed access
- No implicit returns
- No unused locals/parameters

### ESLint Configuration

- NestJS recommended rules
- Stricture enforcement enabled
- No suppressions without justification

### Test Coverage

- Target: >80% coverage for services
- All business rules tested
- Error cases tested
- Integration tests for controllers

## Build and Run

### Development Mode

```bash
pnpm install
pnpm run dev
```

Application runs on `http://localhost:3000`

### Production Build

```bash
pnpm run build
pnpm run start
```

### Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

### Linting

```bash
# Check code style and architecture
pnpm run lint

# Type checking
pnpm run type-check
```

## API Examples

### Create Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature X",
    "description": "Add new user authentication",
    "priority": "high"
  }'
```

**Response:**
```json
{
  "id": "task_1699999999_abc123",
  "title": "Implement feature X",
  "description": "Add new user authentication",
  "status": "todo",
  "priority": "high",
  "createdAt": "2025-11-16T10:30:00.000Z",
  "updatedAt": "2025-11-16T10:30:00.000Z"
}
```

### List Tasks

```bash
curl http://localhost:3000/tasks
```

**Response:**
```json
[
  {
    "id": "task_1699999999_abc123",
    "title": "Implement feature X",
    "description": "Add new user authentication",
    "status": "todo",
    "priority": "high",
    "createdAt": "2025-11-16T10:30:00.000Z",
    "updatedAt": "2025-11-16T10:30:00.000Z"
  }
]
```

### Complete Task

```bash
curl -X PATCH http://localhost:3000/tasks/task_1699999999_abc123/complete
```

**Response:**
```json
{
  "id": "task_1699999999_abc123",
  "title": "Implement feature X",
  "description": "Add new user authentication",
  "status": "done",
  "priority": "high",
  "createdAt": "2025-11-16T10:30:00.000Z",
  "updatedAt": "2025-11-16T10:35:00.000Z"
}
```

## License

MIT
