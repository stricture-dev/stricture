# @stricture/modular - Technical Specification

## Overview

Implements Feature-based Modular Architecture where the system is organized into vertical feature slices (modules). Each module is self-contained with a well-defined public API, ensuring strong encapsulation and module independence.

## Responsibilities

- Define module boundaries (features with public APIs and internals)
- Enforce public API access patterns (imports via index.ts only)
- Prevent direct access to module internals
- Allow shared utilities across all modules
- Export preset configuration

## API Surface

```typescript
export const modularPreset: ArchPreset = {
  id: '@stricture/modular',
  name: 'Modular Architecture',
  description: 'Feature-based modules with explicit public APIs and strong encapsulation',
  boundaries,
  rules,
  diagram,
  scaffolding
}
```

## Architecture Principles

### Module Organization

```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts           # Public API (exports only)
│   │   ├── login.ts           # Internal implementation
│   │   ├── register.ts        # Internal implementation
│   │   └── types.ts           # Internal types
│   ├── dashboard/
│   │   ├── index.ts           # Public API
│   │   └── ...
│   └── profile/
│       ├── index.ts           # Public API
│       └── ...
└── shared/                     # Shared utilities
    ├── components/
    ├── utils/
    └── types/
```

### Dependency Rules

1. **Modules can only import from other modules' public APIs** - Import from `../other-module` not `../other-module/internal-file`
2. **Modules can freely import their own internal files** - Files within a module can import each other
3. **All modules can import from shared** - Shared utilities are accessible to all
4. **External dependencies are controlled** - Modules can import from node_modules
5. **No circular module dependencies** - Module A imports Module B, Module B cannot import Module A (detected at runtime)

### Boundary Descriptions

**Module Public API**
- Pattern: `src/features/*/index.ts`
- Mode: `file`
- Tags: `module-public`, `features`
- Responsibilities: Define what each module exports (components, functions, types)
- Can depend on: module-internal (same module), shared, external
- Cannot depend on: other modules' internals

**Module Internal**
- Pattern: `src/features/**` (excluding index.ts files)
- Mode: `file`
- Tags: `module-internal`, `features`
- Responsibilities: Implementation details of the module
- Can depend on: same module files, shared, external, other modules' public APIs
- Cannot depend on: other modules' internals

**Shared Utilities**
- Pattern: `src/shared/**`
- Mode: `file`
- Tags: `shared`, `common`
- Responsibilities: Common utilities, components, types used across modules
- Can depend on: other shared files, external
- Cannot depend on: any feature modules

## Boundaries (3 boundary types)

```typescript
export const boundaries: BoundaryDefinition[] = [
  {
    name: 'module-public',
    pattern: 'src/features/*/index.ts',
    mode: 'file',
    tags: ['module-public', 'features'],
    metadata: {
      description: 'Public API exports for feature modules',
      visibility: 'public'
    }
  },
  {
    name: 'module-internal',
    pattern: 'src/features/**',
    mode: 'file',
    tags: ['module-internal', 'features'],
    metadata: {
      description: 'Internal implementation files within feature modules',
      visibility: 'private'
    }
  },
  {
    name: 'shared',
    pattern: 'src/shared/**',
    mode: 'file',
    tags: ['shared', 'common'],
    metadata: {
      description: 'Shared utilities, components, and types',
      visibility: 'public'
    }
  }
]
```

## Rules (11 rules)

The preset defines 11 comprehensive rules enforcing modular encapsulation:

### Module Public API Rules

1. **`module-public-self-imports`** - Public API files can import from same module (allowed: true)
   - Allows index.ts to re-export from internal files

2. **`module-public-to-shared`** - Public APIs can import shared utilities (allowed: true)
   - Modules can use common utilities in their public API

3. **`module-public-external`** - Public APIs can import external packages (allowed: true)
   - Modules can expose external types/utilities

### Module Internal Rules

4. **`module-internal-self-imports`** - Internal files can import within features boundary (allowed: true)
   - Enables module cohesion

5. **`module-internal-to-module-public`** - Internal files can import from other modules' public APIs (allowed: true)
   - Cross-module communication through public APIs

6. **`module-internal-to-shared`** - Internal files can import shared utilities (allowed: true)
   - Leverage common utilities

7. **`module-internal-external`** - Internal files can import external packages (allowed: true)
   - Use third-party libraries

### Shared Utilities Rules

8. **`shared-self-imports`** - Shared files can import other shared files (allowed: true)
   - Build on common utilities

9. **`shared-external`** - Shared files can import external packages (allowed: true)
   - Wrap third-party utilities

10. **`shared-not-features`** - Shared cannot import feature modules (allowed: false, with message & examples)
    - Prevent reverse dependencies - shared should be generic

### Type Definitions

11. **`types-external-allowed`** - All boundaries can use TypeScript type definitions (allowed: true)
    - Type safety

All `allowed: false` rules include:
- Descriptive error messages explaining WHY the import is forbidden
- `examples` field with bad and good code examples
- References to modular architecture principles

## Implementation Approach

### Pattern Matching Strategy

The modular preset uses a simpler approach than initially planned:

1. **Public API boundary**: `src/features/*/index.ts` - exact match for index files
2. **Internal boundary**: `src/features/**` - all files under features (including index.ts)
3. **Rules handle the logic**: Rules determine what internal files can/cannot do

Key insight: Both index.ts and internal files match the `features` tag, but we use pattern-based rules with higher specificity for index.ts files.

### Same-Module Detection

The preset does NOT enforce "same module" isolation within a module. All files tagged `module-internal` can import from each other. This is intentional:

**Why**: Module-internal cohesion is good. The important boundary is between different modules, not within a module.

If teams need sub-module boundaries, they can add custom rules.

### Rule Specificity

Rules are ordered by specificity to ensure correct matching:
1. Type definitions (highest specificity - pattern includes @types)
2. Cross-module violations (specific patterns)
3. Same-boundary imports (medium specificity)
4. Shared utilities (medium specificity)
5. External dependencies (lower specificity)

### Deny-by-Default

The preset relies on Stricture's deny-by-default behavior:
- Any import not explicitly allowed by a rule is denied
- Comprehensive allowed rules cover all legitimate imports
- Users receive helpful error messages when rules are violated

### Message Quality

Each violation provides:
- Clear explanation of which module is trying to access what
- Architectural reason why it's forbidden
- Suggested alternatives or patterns to use instead
- Code examples showing correct approach

## Dependencies

- **@stricture/core** (workspace:*)

## Design Decisions

### Why Module Internals Can Import from Public APIs

Internal files within a module can import from other modules' public APIs (index.ts). This is the ONLY way modules should communicate cross-module. This:
- Enforces public API contracts
- Enables refactoring module internals without breaking consumers
- Makes module boundaries explicit

### Why Shared Cannot Import Features

Shared utilities should be generic and reusable. If shared imports a feature module:
- Creates circular dependency risk
- Makes shared less reusable
- Violates the purpose of "shared" (generic utilities)

If code in shared needs feature-specific logic, it should be moved to that feature or parameterized.

### Module Naming Convention

Modules are detected by their location: `src/features/[module-name]/`

Benefits:
- Simple pattern matching
- Clear in file system
- Scales to many modules
- Easy to extract to separate packages later

### Public API via Index Files

Each module MUST have an `index.ts` that defines its public API:
- **What**: Export only what other modules need
- **Why**: Explicit contract, easy to find, clear API
- **How**: Re-export from internal files

```typescript
// src/features/auth/index.ts
export { login, logout } from './services/auth-service.js'
export type { User, AuthError } from './types.js'
// Do NOT export: internal helpers, private components, etc.
```

### Folder Structure Flexibility

Within each module, teams can organize as they prefer:
- `components/`, `hooks/`, `services/`, `utils/`
- Or flat structure
- Or domain-driven structure

The preset only enforces:
1. Public API via index.ts
2. No cross-module internal imports
3. Use shared for common code

### Note on Cross-Module Internal Imports

The current implementation allows internal files to import from other modules' internals IF there's no explicit deny rule. However, this would be caught by deny-by-default when no allow rule matches.

The key enforcement is: files in `features/**` can import from `module-public` (other modules' APIs) but not from specific internal files of other modules.

## Future Enhancements

- Module dependency graph visualization
- Circular dependency detection between modules
- Module coupling metrics (number of imports between modules)
- Support for nested modules (`src/features/auth/login/index.ts`)
- Module boundaries at different paths (e.g., `src/modules/`, `src/domains/`)
- Same-module detection for stricter encapsulation options
