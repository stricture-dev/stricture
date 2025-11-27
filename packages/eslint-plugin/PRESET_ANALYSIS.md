# Stricture Preset Features Analysis

This document analyzes all features used across Stricture presets to inform the design of the translation layer to eslint-plugin-boundaries.

## Executive Summary

**Analyzed Presets:**
- `/packages/hexagonal` - 5 boundaries, 27 rules
- `/packages/clean` - 4 boundaries, 18 rules
- `/packages/layered` - 4 boundaries, 20 rules
- `/packages/modular` - 3 boundaries, 8 rules
- `/packages/nestjs` - 12 boundaries, 42 rules
- `/packages/nextjs` - 7 boundaries, 19 rules

**Total:** 35 boundary definitions, 134 rules

---

## 1. Boundary Definition Features

### 1.1 Core Fields (Always Present)

#### `name: string`
Unique identifier for the boundary.

**Examples:**
```typescript
// Hexagonal
{ name: 'domain' }
{ name: 'driving-adapters' }

// NestJS
{ name: 'controllers' }
{ name: 'services' }

// NextJS
{ name: 'server-components' }
{ name: 'client-components' }
```

#### `pattern: string`
Glob pattern matching files belonging to this boundary.

**Pattern Types Observed:**

1. **Simple directory globs:**
   ```typescript
   'src/domain/**'           // hexagonal
   'src/entities/**'         // clean
   'components/server/**'    // nextjs
   ```

2. **File extension patterns:**
   ```typescript
   'src/**/*.controller.ts'  // nestjs - all controllers
   'src/**/*.service.ts'     // nestjs - all services
   'src/**/*.module.ts'      // nestjs - all modules
   ```

3. **Specific file patterns:**
   ```typescript
   'src/main.ts'                    // nestjs - entry point
   'src/features/*/index.ts'        // modular - only index files
   ```

4. **Negative patterns:**
   ```typescript
   'lib/!(server)/**'  // nextjs - lib excluding server subfolder
   ```

5. **Nested path patterns:**
   ```typescript
   'src/core/domain/**'        // hexagonal
   'src/adapters/driving/**'   // hexagonal
   'src/**/dto/**'             // nestjs - dto folders anywhere
   'src/**/entities/**'        // nestjs - entities folders anywhere
   ```

#### `mode: 'file' | 'folder'`
How to match the pattern.

**Usage:** ALL presets use `mode: 'file'` exclusively.
- No preset uses `'folder'` mode
- This may be historical or `'folder'` mode not well-tested

#### `tags: string[]`
Tags for flexible rule matching.

**Tag Strategies:**

1. **Single-purpose tags:**
   ```typescript
   tags: ['domain']              // unique identifier
   tags: ['controllers']         // unique identifier
   ```

2. **Multi-level tags (most common):**
   ```typescript
   tags: ['core', 'domain']                    // hexagonal
   tags: ['adapters', 'driving']               // hexagonal
   tags: ['nestjs', 'controllers', 'presentation'] // nestjs
   tags: ['components', 'server']              // nextjs
   ```

3. **Tag purposes:**
   - **Specific tag** (domain, controllers) - for precise rules
   - **Category tag** (core, adapters, nestjs) - for group rules
   - **Layer tag** (presentation, infrastructure) - architectural level
   - **Runtime tag** (server, client) - execution context

**Tag Count Distribution:**
- 1 tag: 0 boundaries (none!)
- 2 tags: 31 boundaries (89%)
- 3 tags: 4 boundaries (11%) - all NestJS

### 1.2 Optional Fields

#### `exclude: string[]`
Exclusion patterns (NOT USED in any preset currently)

#### `metadata: object`
Additional contextual information.

**Standard metadata fields:**

```typescript
metadata: {
  description: string    // Human-readable explanation (ALL presets)
  layer: number          // Architectural layer number (4/6 presets)
  // Custom fields below
}
```

**Custom metadata fields by preset:**

**Modular preset:**
```typescript
metadata: {
  description: 'Public API exports for feature modules',
  visibility: 'public'  // or 'private'
}
```

**NextJS preset:**
```typescript
metadata: {
  description: 'React Server Components - can use server-only code',
  runtime: 'server'  // 'server' | 'client' | 'universal'
}
```

**Layer numbers usage:**
```typescript
// Hexagonal (5 layers)
metadata: { layer: 0 }  // domain (innermost)
metadata: { layer: 1 }  // ports
metadata: { layer: 2 }  // application
metadata: { layer: 3 }  // adapters (outermost)

// Clean Architecture (4 layers)
metadata: { layer: 0 }  // entities (innermost)
metadata: { layer: 1 }  // use-cases
metadata: { layer: 2 }  // interface-adapters
metadata: { layer: 3 }  // frameworks-drivers (outermost)

// NestJS (cross-cutting concerns)
metadata: { layer: -1 } // guards, pipes, interceptors, config
metadata: { layer: 0 }  // controllers, dtos (presentation)
metadata: { layer: 1 }  // services (business logic)
metadata: { layer: 2 }  // entities, repositories (data)
```

---

## 2. Rule Definition Features

### 2.1 Core Fields (Always Present)

#### `id: string`
Unique rule identifier using kebab-case.

**Naming Patterns:**
```typescript
// Self-import rules
'domain-self-imports'
'services-to-services'

// Layer-to-layer allowed rules
'application-to-domain'
'controllers-to-services'

// Restriction rules
'domain-isolation'
'dtos-not-entities'
'controllers-not-repositories'

// Direction rules
'driving-to-application'
'driven-implements-ports'

// External access
'application-external'
'types-external-allowed'

// Wildcard rules
'any-to-common'
'all-to-shared'
```

#### `name: string`
Human-readable rule name.

**Examples:**
```typescript
name: 'Domain Isolation'
name: 'Controllers Cannot Import Entities'
name: 'Presentation Can Use Application'
name: 'Guards Available Everywhere'
```

#### `description: string`
What the rule enforces.

**Examples:**
```typescript
description: 'Domain layer must remain pure with no external dependencies'
description: 'Controllers should use DTOs for API contracts, not entities'
description: 'Guards can be used in controllers, services, etc.'
```

#### `severity: 'error' | 'warn' | 'off'`
How to report violations.

**Usage:** ALL rules use `'error'` severity.
- No rules use `'warn'` or `'off'`
- These may be for user overrides only

#### `from: BoundaryPattern`
Source boundary for the import.

#### `to: BoundaryPattern`
Target boundary being imported.

#### `allowed: boolean`
Whether the import is permitted.

**Distribution:**
- `allowed: true` - 96 rules (72%)
- `allowed: false` - 38 rules (28%)

### 2.2 BoundaryPattern Formats

Rules use two main formats for `from` and `to` fields:

#### Tag-based patterns (most common - ~95%)
```typescript
from: { tag: 'domain', mode: 'file' }
to: { tag: 'ports', mode: 'file' }
```

#### Glob pattern-based (~5%)
```typescript
// High-specificity rule for TypeScript type definitions
from: { tag: '*', mode: 'file' }
to: { pattern: 'node_modules/@types/**', mode: 'file' }
```

**Only used for:**
1. TypeScript @types packages (layered, modular)
2. External dependency specificity overrides

#### Wildcard patterns
```typescript
// Match any boundary
{ tag: '*', mode: 'file' }

// Example: domain isolation - deny all other layers
from: { tag: 'domain', mode: 'file' }
to: { tag: '*', mode: 'file' }
allowed: false
```

**Used for:**
1. Isolation rules (domain-isolation, entities-isolation)
2. Cross-cutting concerns (any-to-common, all-to-shared)
3. External dependencies (all-to-external)

#### External tag
```typescript
to: { tag: 'external', mode: 'file' }
```

**Special virtual boundary** for npm packages in node_modules.
- Not defined in boundaries array
- Automatically created by Stricture
- Used in 24 rules across all presets

### 2.3 Optional Fields

#### `message: string`
Custom error message for violations.

**Usage:** Only for `allowed: false` rules (24/38 = 63% of deny rules)

**Message Patterns:**

1. **Explain WHY forbidden:**
   ```typescript
   message: 'Domain layer must remain pure - no dependencies on other layers or external libraries'
   ```

2. **Suggest WHAT to do instead:**
   ```typescript
   message: 'Controllers should not import repositories directly. Use services as an intermediary to keep business logic separate from HTTP handling.'
   ```

3. **Explain architectural principle:**
   ```typescript
   message: 'Use cases cannot depend on interface adapters. Dependencies must point INWARD. Use interfaces to invert dependencies.'
   ```

4. **Short directive:**
   ```typescript
   message: 'Repositories should not import controllers. This violates dependency flow. Controllers call services, services call repositories.'
   ```

#### `examples: { good: string[], bad: string[] }`
Code examples showing violations and fixes.

**Usage:** Only for `allowed: false` rules with messages (24 rules)

**Format:**
```typescript
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
```

**Multi-line examples with explanations:**
```typescript
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
```

**Examples with comments:**
```typescript
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
```

#### `metadata: Record<string, unknown>`
Additional metadata (NOT USED in any preset currently)

---

## 3. Rule Patterns by Category

### 3.1 Self-Import Rules (35 rules)
Allow a boundary to import from itself.

```typescript
{
  id: 'domain-self-imports',
  from: { tag: 'domain', mode: 'file' },
  to: { tag: 'domain', mode: 'file' },
  allowed: true
}
```

**Present in ALL boundaries across all presets.**

### 3.2 Isolation Rules (5 rules)
Deny all outward dependencies from a layer.

```typescript
{
  id: 'domain-isolation',
  from: { tag: 'domain', mode: 'file' },
  to: { tag: '*', mode: 'file' },
  allowed: false,
  message: 'Domain layer must remain pure...',
  examples: { ... }
}
```

**Used in:**
- Hexagonal: domain-isolation
- Clean: entities-isolation
- Layered: domain-not-presentation, domain-not-application

### 3.3 External Dependency Rules (24 rules)
Allow importing external npm packages.

```typescript
{
  id: 'application-external',
  from: { tag: 'application', mode: 'file' },
  to: { tag: 'external', mode: 'file' },
  allowed: true
}
```

**Pattern:** Nearly every boundary has an `*-external` rule allowing external imports.

### 3.4 Cross-Cutting Concern Rules (7 rules)
Allow certain boundaries to be imported from anywhere.

```typescript
{
  id: 'any-to-common',
  from: { tag: '*', mode: 'file' },
  to: { tag: 'common', mode: 'file' },
  allowed: true
}
```

**Used for:**
- NestJS: common, guards, interceptors, pipes, decorators, config
- Modular: shared utilities
- NextJS: shared utilities

### 3.5 Type Definition Override Rules (2 rules)
High-specificity rule allowing @types imports.

```typescript
{
  id: 'types-external-allowed',
  from: { tag: '*', mode: 'file' },
  to: { pattern: 'node_modules/@types/**', mode: 'file' },
  allowed: true
}
```

**Used in:** Layered, Modular (explicitly overrides external restrictions)

### 3.6 Architecture-Specific Rules

#### Hexagonal (17 rules)
- Driving/driven adapter separation
- Port-based dependency inversion
- Application orchestration layer

#### Clean (13 rules)
- Inward-only dependencies
- Interface adapters layer
- Use case isolation

#### Layered (15 rules)
- Top-to-bottom dependencies only
- Presentation → Application → Domain → Infrastructure

#### Modular (6 rules)
- Public API enforcement (via index.ts)
- Shared utilities independence

#### NestJS (35 rules)
- DTO/Entity separation
- Controller → Service → Repository flow
- Cross-cutting concerns available everywhere

#### NextJS (16 rules)
- Server/client separation
- Server Actions for client→server communication
- API routes isolation from components

---

## 4. Stricture-Specific Features

### 4.1 Features Not in eslint-plugin-boundaries

#### Deny-by-Default
**Stricture:** If no rule matches an import, it's denied with helpful error.
**Boundaries:** Allow-by-default, only enforces explicit rules.

**Impact:** Need to simulate with catch-all deny rules or change philosophy.

#### Rule Specificity System
**Stricture:** Automatic rule sorting by calculated specificity score.
**Boundaries:** Rules checked in array order.

**Specificity calculation:**
```typescript
// Pattern with node_modules: 10000 points
// Regular pattern: 1000 points
// Specific tag: 100 points
// Wildcard: 1 point
// Total = from_score + to_score
```

**Impact:** Must pre-sort rules or rely on boundaries' array order.

#### Virtual 'external' Boundary
**Stricture:** Automatically detects `node_modules` in paths, creates virtual boundary.
**Boundaries:** Must explicitly define `external` element.

**Detection:**
```typescript
// Automatic in Stricture
toPath.includes('node_modules') → virtual { name: 'external', tag: 'external' }
```

**Impact:** Must define `external` element explicitly in boundaries config.

#### Multi-Tag Boundaries
**Stricture:** Boundaries can have multiple tags for flexible matching.
```typescript
{ name: 'driving-adapters', tags: ['adapters', 'driving'] }
{ name: 'driven-adapters', tags: ['adapters', 'driven'] }

// Rule can match both via 'adapters' tag
from: { tag: 'adapters' }
```

**Boundaries:** Elements have one `type` field.

**Impact:** May need to flatten boundaries or use multiple elements.

#### Metadata Extensibility
**Stricture:** Arbitrary metadata fields (layer, visibility, runtime).
**Boundaries:** Fixed schema.

**Impact:** Metadata likely lost in translation, only for documentation.

#### Examples in Rules
**Stricture:** `examples: { good: [], bad: [] }` for inline documentation.
**Boundaries:** No equivalent.

**Impact:** Examples will be lost, could be preserved in comments.

#### Pattern-based TO matching
**Stricture:** Rules can match target by glob pattern OR tag.
```typescript
to: { pattern: 'node_modules/@types/**', mode: 'file' }
```

**Boundaries:** Uses `target` with element patterns and constraints.

**Impact:** Need to create specific elements for pattern-based rules.

### 4.2 Mode Field Semantics

**Stricture `mode`:**
- `'file'` - Match individual files
- `'folder'` - Match whole folders (not used in any preset)

**Boundaries `captureAs`:**
- `'full'` - Full import path
- `'file'` - Filename only
- `'folder'` - Parent folder name

**Impact:** Semantic mismatch - need careful translation.

---

## 5. Translation Challenges

### 5.1 Critical Challenges

#### Challenge 1: Deny-by-Default Philosophy
**Problem:** Stricture denies unlisted imports; boundaries allows them.

**Options:**
1. Add catch-all deny rules (complex, error-prone)
2. Document the difference (user must be aware)
3. Add mode flag to boundaries config

#### Challenge 2: Rule Specificity vs Array Order
**Problem:** Stricture auto-sorts by specificity; boundaries uses array order.

**Options:**
1. Pre-calculate specificity and sort during translation
2. Document that rule order matters in boundaries
3. Generate rules in specificity order with comments

#### Challenge 3: Multi-Tag Boundaries
**Problem:** Stricture boundary has `tags: ['core', 'domain']`; boundaries element has `type: 'domain'`.

**Options:**
1. Create multiple elements (one per tag combo)
2. Use one primary tag, lose others
3. Use from/importKind for secondary matching

#### Challenge 4: Virtual External Boundary
**Problem:** Stricture auto-creates external boundary; boundaries needs explicit element.

**Solution:** Always inject external element definition:
```javascript
{
  type: 'external',
  pattern: 'node_modules/**',
  mode: 'file'
}
```

#### Challenge 5: Pattern-based TO Matching
**Problem:** Stricture rules like `to: { pattern: 'node_modules/@types/**' }`

**Solution:** Create dedicated element:
```javascript
{
  type: 'types',
  pattern: 'node_modules/@types/**',
  mode: 'file'
}
```

### 5.2 Minor Challenges

#### Metadata Loss
Most metadata is for documentation and won't translate:
- `description` - becomes comment
- `layer` - becomes comment
- `visibility`, `runtime` - lost

#### Examples Loss
`examples: { good, bad }` has no boundaries equivalent.
- Could be preserved in rule comments
- Could be added to error messages

#### Custom Messages
Stricture: `message: 'Custom error'`
Boundaries: `message: 'Custom error'` (supported!)

**Solution:** Direct translation.

---

## 6. Translation Strategy Recommendations

### 6.1 Boundary Translation

```typescript
// Stricture boundary
{
  name: 'domain',
  pattern: 'src/core/domain/**',
  mode: 'file',
  tags: ['core', 'domain'],
  metadata: { description: 'Pure business logic', layer: 0 }
}

// →  Boundaries element
{
  type: 'domain',  // Primary tag
  pattern: 'src/core/domain/**',
  mode: 'file',
  // Secondary tags: use capture or importKind?
  // Metadata: add as comment above
}
```

### 6.2 Rule Translation

```typescript
// Stricture rule (allowed)
{
  id: 'application-to-domain',
  from: { tag: 'application', mode: 'file' },
  to: { tag: 'domain', mode: 'file' },
  allowed: true
}

// → Boundaries rule
{
  from: 'application',
  allow: ['domain']
}
```

```typescript
// Stricture rule (denied with message)
{
  id: 'domain-isolation',
  from: { tag: 'domain', mode: 'file' },
  to: { tag: '*', mode: 'file' },
  allowed: false,
  message: 'Domain must remain pure',
  examples: { bad: [...], good: [...] }
}

// → Boundaries rule
{
  from: 'domain',
  disallow: ['*'],
  message: 'Domain must remain pure'
  // Examples as comment above rule
}
```

### 6.3 External Boundary Injection

Always add to boundaries config:
```javascript
{
  type: 'external',
  pattern: 'node_modules/**',
  mode: 'file',
  capture: 'packageName'  // or 'full'
}
```

### 6.4 Rule Sorting

Pre-sort rules by specificity before generating:
1. Calculate specificity score
2. Sort descending
3. Add comment explaining rule order matters
4. Group by from-boundary for readability

### 6.5 Comment Preservation

Add comments for lost information:
```javascript
// BOUNDARY: domain
// Description: Pure business logic - entities, value objects, domain services
// Layer: 0 (innermost)
// Tags: core, domain
{
  type: 'domain',
  pattern: 'src/core/domain/**',
  mode: 'file'
}

// RULE: domain-isolation (deny)
// Description: Domain layer must remain pure with no external dependencies
// BAD: import { Database } from '../../adapters/database'
// GOOD: import { Order } from './order'
{
  from: 'domain',
  disallow: ['*'],
  message: 'Domain layer must remain pure - no dependencies on other layers or external libraries'
}
```

---

## 7. Summary: Features to Preserve

### Must Preserve
✅ Boundary patterns (glob, negation, wildcards)
✅ Boundary names → element types
✅ Rule from/to matching
✅ Rule allowed → allow/disallow
✅ Custom error messages
✅ External dependency handling

### Should Preserve (with translation)
⚠️ Primary tag → type
⚠️ Rule specificity → sort order
⚠️ Virtual external → explicit element
⚠️ Pattern-based to → dedicated element

### Cannot Preserve (document loss)
❌ Multi-tag matching (choose primary)
❌ Metadata (description, layer, custom)
❌ Examples (convert to comments)
❌ Deny-by-default (philosophy difference)
❌ Mode semantics (different meaning)

### Optional Enhancement
💡 Add generated comments for:
- Original boundary metadata
- Rule descriptions
- Good/bad examples
- Specificity scores
- Translation notes

---

## 8. Next Steps

1. **Design translation algorithm**
   - Boundary → element mapping
   - Rule → allow/disallow mapping
   - Specificity calculation
   - Sort rules by specificity

2. **Handle edge cases**
   - Multi-tag boundaries (flatten or choose primary)
   - Wildcard rules (*, external)
   - Pattern-based to (create elements)
   - Self-import rules (allow: ['same-tag'])

3. **Build translator**
   - Read Stricture config
   - Calculate specificity
   - Generate boundaries elements
   - Generate boundaries rules
   - Add comments
   - Write boundaries config

4. **Test against all presets**
   - Translate each preset
   - Verify functional equivalence
   - Document differences
   - Create test suite

5. **Document limitations**
   - What's preserved
   - What's lost
   - Behavior differences
   - Migration guide
