# Simple Clean Architecture Example - Technical Specification

## Overview

A minimal, educational example demonstrating Uncle Bob's Clean Architecture with Stricture enforcement.

## Architecture

### Four Concentric Circles

1. **Entities (Layer 0)** - Enterprise business rules
2. **Use Cases (Layer 1)** - Application business rules
3. **Interface Adapters (Layer 2)** - Interface adapters and controllers
4. **Frameworks & Drivers (Layer 3)** - External agencies

### The Dependency Rule

All source code dependencies must point INWARD only, toward entities.

## Domain Model

### Task Entity

Enterprise business rules for a task with properties:
- `id`: Unique identifier
- `title`: Task title (1-200 characters)
- `description`: Task description (max 2000 characters)
- `status`: TODO, IN_PROGRESS, or DONE
- `priority`: LOW, MEDIUM, or HIGH
- `createdAt`: Creation timestamp
- `completedAt`: Completion timestamp (nullable)

Business rules:
- Title cannot be empty
- Completed tasks must have `completedAt`
- Cannot start a completed task
- Cannot complete an already completed task
- Can only reopen completed tasks
- Cannot change priority of completed tasks

## Use Cases

### CreateTaskUseCase

**Input:**
- title: string
- description: string
- priority: TaskPriority

**Flow:**
1. Generate unique ID
2. Create Task entity (validation in constructor)
3. Save through TaskGateway
4. Present success through TaskOutputPort

**Output:** Presents task creation result

### ListTasksUseCase

**Input:** None

**Flow:**
1. Retrieve all tasks through TaskGateway
2. Present list through TaskOutputPort

**Output:** Presents task list

### CompleteTaskUseCase

**Input:**
- taskId: string

**Flow:**
1. Find task by ID through TaskGateway
2. Call `task.complete()` (business logic in entity)
3. Save updated task through TaskGateway
4. Present success through TaskOutputPort

**Output:** Presents completion result

## Interfaces (Ports)

### TaskGateway (Data Access)

Defined in use-cases layer, implemented in interface-adapters layer.

```typescript
interface TaskGateway {
  save(task: Task): Promise<void>
  findById(id: string): Promise<Task | null>
  findAll(): Promise<Task[]>
  delete(id: string): Promise<void>
}
```

### TaskOutputPort (Presentation)

Defined in use-cases layer, implemented in interface-adapters layer.

```typescript
interface TaskOutputPort {
  presentTask(task: Task): void
  presentTaskList(tasks: Task[]): void
  presentError(message: string): void
  presentSuccess(message: string): void
}
```

## Interface Adapters

### InMemoryTaskGateway

Implements `TaskGateway` with in-memory Map storage.

### ConsoleTaskPresenter

Implements `TaskOutputPort` with console.log formatting.

### TaskController

Receives CLI input, converts to use case input format, invokes use cases.

## Frameworks & Drivers

### CLI

Command-line interface that parses arguments and delegates to controller.

Commands:
- `create <title> <description> <priority>` - Create task
- `list` - List all tasks
- `complete <task-id>` - Complete task
- `help` - Show help

### Composition Root (index.ts)

Wires all dependencies together:
1. Create gateway and presenter
2. Create use cases (inject gateway and presenter)
3. Create controller (inject use cases)
4. Create CLI (inject controller)
5. Run CLI

## Dependency Flow

```
CLI → Controller → Use Cases → Entities
                 ↓
    Gateway ← TaskGateway interface
    Presenter ← TaskOutputPort interface
```

All arrows point inward toward entities.

## Stricture Configuration

Uses `@stricture/clean` preset with four boundaries:
- entities: `src/entities/**`
- use-cases: `src/use-cases/**`
- interface-adapters: `src/interface-adapters/**`
- frameworks-drivers: `src/frameworks-drivers/**`

## Testing Strategy

### Unit Tests

- **Entities:** Test business rules in isolation
- **Use Cases:** Test with mock gateway and presenter
- **Interface Adapters:** Test implementations
- **CLI:** Test argument parsing

### Integration Tests

- Test complete flows through all layers
- Verify dependency injection works correctly

## Example Usage

```bash
# Create a task
node index.js create "Buy milk" "2% milk from store" high

# List tasks
node index.js list

# Complete task
node index.js complete task_abc123def
```

## Key Architectural Decisions

1. **Dependency Inversion:** Use cases define interfaces, adapters implement them
2. **Entity Immutability:** Entities return new instances on state changes
3. **Output Ports:** Separate presentation logic from use case logic
4. **Composition Root:** All wiring happens in one place (index.ts)
5. **No Framework in Use Cases:** Business logic is framework-independent
