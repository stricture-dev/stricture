# Simple Layered Architecture Example

> A minimal terminal app demonstrating Layered Architecture with Stricture boundary enforcement

## Overview

This is a minimal, runnable example of **Layered Architecture** (N-tier). It demonstrates how `@stricture` enforces architectural boundaries in a real TypeScript project. The example implements a simple task management system that stores tasks in memory and runs from the terminal.

**What you'll learn:**
- How to structure a Layered Architecture project with four layers
- How dependencies flow strictly from top to bottom
- How to configure Stricture for automatic boundary enforcement
- The difference between presentation, application, domain, and infrastructure layers

## Architecture Diagram

```
┌─────────────────────────────────────┐
│  Presentation Layer (Top)           │ ← CLI, HTTP Controllers
│  src/presentation/                  │
└──────────────┬──────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────┐
│  Application Layer                  │ ← Use Cases, Services
│  src/application/                   │
└──────────────┬──────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────┐
│  Domain Layer                       │ ← Entities, Business Logic
│  src/domain/                        │
└──────────────┬──────────────────────┘
               │ can reference
               ↓
┌─────────────────────────────────────┐
│  Infrastructure Layer (Bottom)      │ ← Data Access, External APIs
│  src/infrastructure/                │
└─────────────────────────────────────┘
```

**Dependency Flow:** TOP → BOTTOM only

## The Four Layers

### 1. Presentation Layer (Top)

**Location**: `src/presentation/`

**Purpose**: Handle user interaction (CLI, HTTP, GraphQL)

**In this example**: The `CLI` class that processes command-line arguments

**Dependencies**:
- ✅ CAN depend on: Application, Domain, Infrastructure
- ❌ CANNOT depend on: Nothing (it's the top layer)

**Code example** (`src/presentation/cli.ts`):
```typescript
export class CLI {
  constructor(
    private createTask: CreateTaskUseCase,  // Application layer
    private listTasks: ListTasksUseCase,    // Application layer
    private completeTask: CompleteTaskUseCase  // Application layer
  ) {}

  async handleCreate(args: string[]): Promise<void> {
    const task = await this.createTask.execute({
      title: args[0],
      description: args[1],
      priority: args[2] as Priority
    })
    this.displayTask(task)
  }
}
```

### 2. Application Layer

**Location**: `src/application/`

**Purpose**: Orchestrate use cases and business workflows

**In this example**:
- `CreateTaskUseCase` - Creates a new task
- `ListTasksUseCase` - Lists all tasks
- `CompleteTaskUseCase` - Marks a task as complete

**Dependencies**:
- ✅ CAN depend on: Domain, Infrastructure
- ❌ CANNOT depend on: Presentation

**Code example** (`src/application/create-task.ts`):
```typescript
export class CreateTaskUseCase {
  constructor(private taskRepo: TaskRepository) {}  // Infrastructure

  async execute(input: CreateTaskInput): Promise<Task> {
    const task = new Task(...)  // Domain entity
    
    if (!task.isValid()) {  // Domain business rule
      throw new Error('Invalid task')
    }
    
    await this.taskRepo.save(task)  // Infrastructure
    return task
  }
}
```

### 3. Domain Layer

**Location**: `src/domain/`

**Purpose**: Core business logic and rules

**In this example**: The `Task` entity with business rules

**Dependencies**:
- ✅ CAN depend on: Infrastructure (for interfaces), External (minimal)
- ❌ CANNOT depend on: Presentation, Application

**Code example** (`src/domain/task.ts`):
```typescript
export class Task {
  complete(): Task {
    if (this.status === TaskStatus.DONE) {
      throw new Error('Task is already completed')  // Business rule
    }
    
    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.DONE,  // State change
      this.priority,
      this.createdAt,
      new Date()
    )
  }
}
```

### 4. Infrastructure Layer (Bottom)

**Location**: `src/infrastructure/`

**Purpose**: Data access and external system integration

**In this example**: `TaskRepository` for in-memory storage

**Dependencies**:
- ✅ CAN depend on: External libraries (database drivers, etc.)
- ❌ CANNOT depend on: Presentation, Application, Domain

**Code example** (`src/infrastructure/task-repository.ts`):
```typescript
export class TaskRepository {
  private tasks: Map<string, Task> = new Map()

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task)
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null
  }
}
```

## Installation

```bash
# From repository root
cd examples/simple-layered

# Install dependencies
pnpm install

# Build TypeScript
pnpm build
```

## Usage

### Create a Task

```bash
node index.js create "Buy groceries" "Get milk and eggs" high
```

**Output:**
```
Task "Buy groceries" created successfully

Task Details:
  ID: task_1699999999999_abc123
  Title: Buy groceries
  Description: Get milk and eggs
  Status: TODO
  Priority: HIGH
  Created: 11/13/2025, 9:30:00 PM
```

### List All Tasks

```bash
node index.js list
```

**Output:**
```
Tasks (2):

  [TODO] [HIGH] Buy groceries
    ID: task_1699999999999_abc123
    Description: Get milk and eggs

  [TODO] [MEDIUM] Write report
    ID: task_1699999999998_def456
```

### Complete a Task

```bash
node index.js complete task_1699999999999_abc123
```

**Output:**
```
Task "Buy groceries" completed

Task Details:
  ID: task_1699999999999_abc123
  Title: Buy groceries
  Status: DONE
  Completed: 11/13/2025, 9:35:00 PM
```

## Stricture Configuration

See `.stricture/config.json`:

```json
{
  "preset": "@stricture/layered"
}
```

That's it! The preset automatically provides:
- 4 boundary definitions (presentation, application, domain, infrastructure)
- 21 dependency rules enforcing top-to-bottom dependencies
- Helpful error messages for violations

## The Dependency Rule in Action

### ✅ Valid: Presentation Depends on Application

```typescript
// src/presentation/cli.ts
import { CreateTaskUseCase } from '../application/create-task.js'  // ✅ Lower layer

export class CLI {
  constructor(private createTask: CreateTaskUseCase) {}
}
```

### ❌ Invalid: Application Depends on Presentation

```typescript
// src/application/create-task.ts
import { CLI } from '../presentation/cli.js'  // ❌ Upper layer!

export class CreateTaskUseCase {
  // WRONG: Application should not know about presentation
}
```

**Stricture will catch this:**
```
src/application/create-task.ts
  2:1  error  Application layer cannot depend on presentation layer
             @stricture/enforce-boundaries
```

### ❌ Invalid: Infrastructure Depends on Application

```typescript
// src/infrastructure/task-repository.ts
import { CreateTaskUseCase } from '../application/create-task.js'  // ❌ Upper layer!

export class TaskRepository {
  // WRONG: Infrastructure is the bottom layer
}
```

**Stricture will catch this:**
```
src/infrastructure/task-repository.ts
  2:1  error  Infrastructure layer cannot depend on application layer
             @stricture/enforce-boundaries
```

## Why Layered Architecture?

### 1. Clear Separation of Concerns

Each layer has a specific responsibility:
- Presentation: User interaction
- Application: Business workflows
- Domain: Business rules
- Infrastructure: Data access

### 2. Easy to Understand

The top-to-bottom dependency flow is simple and intuitive. New team members can quickly understand the structure.

### 3. Testable

```typescript
// Easy to test - just mock the repository!
const mockRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn()
}

const useCase = new CreateTaskUseCase(mockRepo)
await useCase.execute({ title: 'Test', description: '', priority: 'LOW' })

expect(mockRepo.save).toHaveBeenCalled()
```

### 4. Flexible Infrastructure

Want to switch from in-memory to PostgreSQL? Just create a new `PostgresTaskRepository`. No changes to application or domain logic!

## File Structure

```
examples/simple-layered/
├── .stricture/
│   └── config.json              # Stricture configuration
├── .eslintrc.cjs                # ESLint + Stricture integration
├── package.json
├── tsconfig.json
├── index.ts                     # Composition root
├── src/
│   ├── presentation/            # Layer 0 (Top): User interface
│   │   └── cli.ts               # Command-line interface
│   ├── application/             # Layer 1: Use cases
│   │   ├── create-task.ts       # Create task use case
│   │   ├── list-tasks.ts        # List tasks use case
│   │   └── complete-task.ts     # Complete task use case
│   ├── domain/                  # Layer 2: Business logic
│   │   └── task.ts              # Task entity
│   └── infrastructure/          # Layer 3 (Bottom): Data access
│       └── task-repository.ts   # In-memory repository
└── README.md
```

## Learning More

### Stricture Documentation
- [Main Stricture Documentation](../../README.md)
- [Layered Architecture Preset Documentation](../../packages/layered/README.md)
- [ESLint Plugin Documentation](../../packages/eslint-plugin/README.md)

### Layered Architecture
- [Layered Architecture Pattern](https://en.wikipedia.org/wiki/Multitier_architecture)
- [N-tier Architecture](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier)

### Other Examples
- [Simple Hexagonal Example](../simple-hexagonal/) - Different architecture pattern
- [Simple Clean Example](../simple-clean/) - Clean Architecture pattern

## License

MIT
