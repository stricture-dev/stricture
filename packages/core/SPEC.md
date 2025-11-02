# @stricture/core - Technical Specification

## Overview

`@stricture/core` is the foundational package for the Stricture ecosystem. It provides zero-dependency TypeScript types, interfaces, schemas, and utilities that all other Stricture packages depend on. This package defines the contract for how architectural boundaries are specified, validated, and enforced.

## Responsibilities

- Define core TypeScript types for architectural rules and boundaries
- Provide configuration schema for `.stricture/config.json`
- Export validation utilities for rules and configurations
- Define preset interfaces that architecture packages implement
- Provide pattern matching utilities for file paths and boundaries
- Maintain zero runtime dependencies (TypeScript only)

## API Surface

### Types

#### `ArchRule`
Represents a single architectural boundary enforcement rule.

```typescript
interface ArchRule {
  id: string                      // Unique identifier (e.g., 'no-domain-external')
  name: string                    // Display name (e.g., 'Domain Isolation')
  description: string             // Detailed explanation
  severity: 'error' | 'warn'      // How to report violations
  from: BoundaryPattern           // Source boundary
  to: BoundaryPattern             // Target boundary
  allowed: boolean                // Whether import is permitted
  message?: string                // Custom error message
  examples?: {
    good: string[]                // Valid import examples
    bad: string[]                 // Invalid import examples
  }
  metadata?: Record<string, unknown>
}
```

#### `BoundaryPattern`
Defines how to match files against boundaries.

```typescript
interface BoundaryPattern {
  pattern?: string                // Glob pattern (e.g., 'src/domain/**/*.ts')
  tag?: string                    // Tag reference (e.g., 'domain')
  mode: 'file' | 'folder'         // Match individual files or whole folders
  exclude?: string[]              // Exclusion patterns
}
```

#### `BoundaryDefinition`
Defines a named boundary in the architecture.

```typescript
interface BoundaryDefinition {
  name: string                    // Boundary name (e.g., 'domain', 'adapters')
  pattern: string                 // Glob pattern for files
  mode: 'file' | 'folder'         // Matching mode
  tags?: string[]                 // Tags for this boundary
  exclude?: string[]              // Patterns to exclude
  metadata?: {
    description?: string
    layer?: number                // For layered architectures
    [key: string]: unknown
  }
}
```

#### `ArchPreset`
Complete architecture preset definition.

```typescript
interface ArchPreset {
  id: string                      // Unique preset ID (e.g., '@stricture/hexagonal')
  name: string                    // Display name
  description: string             // What this architecture is
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  diagram?: DiagramDefinition     // Visual diagram data
  scaffolding?: ScaffoldingTemplate
  metadata?: {
    version?: string
    author?: string
    url?: string
    [key: string]: unknown
  }
}
```

#### `StrictureConfig`
Project configuration schema (stored in `.stricture/config.json`).

```typescript
interface StrictureConfig {
  version?: string                // Config version (default: '1')
  preset: string                  // Base preset (e.g., '@stricture/hexagonal')
  extends?: string[]              // Additional presets to merge
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  overrides?: Partial<ArchRule>[] // Override specific rules
  ignorePatterns?: string[]       // Global ignore patterns
  metadata?: Record<string, unknown>
}
```

#### `DiagramDefinition`
Architecture diagram representation.

```typescript
interface DiagramDefinition {
  type: 'mermaid' | 'svg' | 'ascii'
  content: string
  layers?: {
    name: string
    boundaries: string[]          // Boundary names in this layer
    position: number              // Vertical position
  }[]
}
```

#### `ScaffoldingTemplate`
Template for generating project structure.

```typescript
interface ScaffoldingTemplate {
  directories: {
    path: string
    description?: string
  }[]
  files?: {
    path: string
    content: string
    description?: string
  }[]
}
```

#### `ValidationResult`
Result of validation operations.

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  path: string                    // JSON path to error (e.g., 'rules[0].from')
  message: string
  code: string                    // Error code (e.g., 'MISSING_REQUIRED_FIELD')
}
```

### Functions

#### `validateConfig(config: unknown): ValidationResult`
Validates a complete Stricture configuration.

```typescript
export function validateConfig(config: unknown): ValidationResult
```

**Validation checks**:
- Required fields present
- Type correctness
- Pattern syntax validity
- Rule references valid boundaries
- No circular dependencies in extends
- Severity values are valid

#### `validateRule(rule: unknown): ValidationResult`
Validates a single architectural rule.

```typescript
export function validateRule(rule: unknown): ValidationResult
```

#### `validateBoundary(boundary: unknown): ValidationResult`
Validates a boundary definition.

```typescript
export function validateBoundary(boundary: unknown): ValidationResult
```

#### `matchesPattern(filePath: string, pattern: BoundaryPattern): boolean`
Checks if a file path matches a boundary pattern.

```typescript
export function matchesPattern(
  filePath: string,
  pattern: BoundaryPattern,
  boundaries?: BoundaryDefinition[]
): boolean
```

**Implementation notes**:
- Uses minimatch for glob pattern matching
- Supports negation patterns
- Handles tag resolution via boundaries parameter
- Respects exclude patterns

#### `mergeBoundaries(base: BoundaryDefinition[], override: BoundaryDefinition[]): BoundaryDefinition[]`
Merges two sets of boundary definitions (for preset extension).

```typescript
export function mergeBoundaries(
  base: BoundaryDefinition[],
  override: BoundaryDefinition[]
): BoundaryDefinition[]
```

**Merge strategy**:
- Override replaces base if names match
- Otherwise, concatenate
- Preserve order: base first, then overrides

#### `mergeRules(base: ArchRule[], override: ArchRule[]): ArchRule[]`
Merges two sets of rules.

```typescript
export function mergeRules(
  base: ArchRule[],
  override: ArchRule[]
): ArchRule[]
```

**Merge strategy**:
- Override replaces base if IDs match
- Preserve severity changes
- Maintain rule order

#### `resolveConfig(config: StrictureConfig, presets: Map<string, ArchPreset>): StrictureConfig`
Resolves a configuration by merging in extended presets.

```typescript
export function resolveConfig(
  config: StrictureConfig,
  presets: Map<string, ArchPreset>
): StrictureConfig
```

### Exports

```typescript
// Main exports
export {
  // Types
  type ArchRule,
  type BoundaryPattern,
  type BoundaryDefinition,
  type ArchPreset,
  type StrictureConfig,
  type DiagramDefinition,
  type ScaffoldingTemplate,
  type ValidationResult,
  type ValidationError,

  // Utilities
  validateConfig,
  validateRule,
  validateBoundary,
  matchesPattern,
  mergeBoundaries,
  mergeRules,
  resolveConfig
}
```

## Implementation Approach

### Key Files

```
packages/core/
├── src/
│   ├── index.ts                 // Main exports
│   ├── types/
│   │   ├── rule.ts              // ArchRule and related types
│   │   ├── boundary.ts          // Boundary types
│   │   ├── preset.ts            // ArchPreset type
│   │   ├── config.ts            // StrictureConfig type
│   │   ├── diagram.ts           // DiagramDefinition type
│   │   └── validation.ts        // ValidationResult type
│   ├── validation/
│   │   ├── validate-config.ts
│   │   ├── validate-rule.ts
│   │   ├── validate-boundary.ts
│   │   └── validators.ts        // Shared validation helpers
│   ├── matching/
│   │   ├── match-pattern.ts
│   │   └── glob-utils.ts
│   └── merging/
│       ├── merge-boundaries.ts
│       ├── merge-rules.ts
│       └── resolve-config.ts
├── tests/
│   ├── validation.test.ts
│   ├── matching.test.ts
│   └── merging.test.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── SPEC.md
```

### Architecture

**Modular structure**:
- `types/` - Pure TypeScript type definitions
- `validation/` - Runtime validation logic
- `matching/` - Pattern matching algorithms
- `merging/` - Configuration merging logic

**Design principles**:
- Zero runtime dependencies (except minimatch for glob matching)
- Pure functions (no side effects)
- Immutable data structures
- Fail-fast validation
- Detailed error messages

### Algorithm/Logic

#### Pattern Matching Algorithm

```typescript
function matchesPattern(filePath, pattern, boundaries) {
  // 1. Resolve tag to pattern if needed
  if (pattern.tag) {
    const boundary = boundaries.find(b => b.name === pattern.tag)
    if (!boundary) return false
    pattern = { ...pattern, pattern: boundary.pattern }
  }

  // 2. Check exclusions first
  if (pattern.exclude) {
    for (const exclude of pattern.exclude) {
      if (minimatch(filePath, exclude)) return false
    }
  }

  // 3. Check pattern match
  if (pattern.mode === 'folder') {
    // Match entire directory
    const dirPath = path.dirname(filePath)
    return minimatch(dirPath, pattern.pattern)
  } else {
    // Match file
    return minimatch(filePath, pattern.pattern)
  }
}
```

#### Config Resolution Algorithm

```typescript
function resolveConfig(config, presets) {
  // 1. Start with base preset
  const basePreset = presets.get(config.preset)
  let resolved = {
    boundaries: [...basePreset.boundaries],
    rules: [...basePreset.rules]
  }

  // 2. Merge extended presets
  for (const extendId of config.extends || []) {
    const extendPreset = presets.get(extendId)
    resolved.boundaries = mergeBoundaries(resolved.boundaries, extendPreset.boundaries)
    resolved.rules = mergeRules(resolved.rules, extendPreset.rules)
  }

  // 3. Apply project-specific boundaries and rules
  resolved.boundaries = mergeBoundaries(resolved.boundaries, config.boundaries)
  resolved.rules = mergeRules(resolved.rules, config.rules)

  // 4. Apply overrides
  for (const override of config.overrides || []) {
    const index = resolved.rules.findIndex(r => r.id === override.id)
    if (index >= 0) {
      resolved.rules[index] = { ...resolved.rules[index], ...override }
    }
  }

  return resolved
}
```

## Dependencies

### Runtime Dependencies

- **minimatch** (^9.0.0) - Glob pattern matching

### Dev Dependencies

- **typescript** (^5.3.0) - TypeScript compiler
- **tsup** (^8.0.0) - Build tool
- **vitest** (^1.2.0) - Testing framework
- **@stricture/typescript-config** (workspace:*) - Shared TypeScript config
- **@stricture/eslint-config** (workspace:*) - Shared ESLint config

### Peer Dependencies

None

## Testing Strategy

### Unit Tests

**Test coverage areas**:
1. **Type validation**
   - Valid configurations pass
   - Invalid configurations fail with correct errors
   - Edge cases (empty arrays, missing fields, etc.)

2. **Pattern matching**
   - File patterns match correctly
   - Folder patterns match correctly
   - Exclusions work
   - Tag resolution works

3. **Merging logic**
   - Boundaries merge correctly
   - Rules merge correctly
   - Overrides apply correctly
   - Preset extension works

4. **Edge cases**
   - Circular extends dependencies
   - Invalid glob patterns
   - Missing tag references
   - Duplicate boundary names

### Integration Tests

Test interaction between validation, matching, and merging:
- Full config resolution pipeline
- Complex preset inheritance
- Multi-level extends chains

### Test Files

```
tests/
├── validation/
│   ├── config.test.ts
│   ├── rule.test.ts
│   └── boundary.test.ts
├── matching/
│   ├── pattern.test.ts
│   └── glob.test.ts
├── merging/
│   ├── boundaries.test.ts
│   ├── rules.test.ts
│   └── config.test.ts
└── fixtures/
    ├── valid-configs/
    ├── invalid-configs/
    └── presets/
```

**Test approach**:
- Use Vitest for fast unit tests
- Snapshot testing for validation errors
- Property-based testing for pattern matching
- Fixtures for realistic configs

## Configuration

### Build Configuration (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false
})
```

### TypeScript Configuration

```json
{
  "extends": "@stricture/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Options

This package doesn't have runtime options. It exports functions that accept parameters.

### Defaults

- Validation strictness: Fail-fast (first error stops validation)
- Pattern matching: Case-sensitive
- Merge strategy: Override by name/ID

## Error Handling

### Validation Errors

**Structure**:
```typescript
{
  valid: false,
  errors: [
    {
      path: 'rules[0].from.pattern',
      message: 'Invalid glob pattern: unclosed bracket',
      code: 'INVALID_GLOB_PATTERN'
    }
  ]
}
```

**Error codes**:
- `MISSING_REQUIRED_FIELD` - Required field not present
- `INVALID_TYPE` - Wrong type
- `INVALID_GLOB_PATTERN` - Malformed glob pattern
- `UNKNOWN_TAG` - Tag reference doesn't exist
- `INVALID_SEVERITY` - Severity not 'error' or 'warn'
- `CIRCULAR_EXTENDS` - Circular dependency in extends
- `UNKNOWN_PRESET` - Referenced preset doesn't exist

### Runtime Errors

Functions throw errors for:
- Invalid arguments (not validation failures)
- Internal bugs

**Error handling strategy**:
- Validation: Return `ValidationResult` (never throw)
- Utilities: Throw descriptive errors
- Pattern matching: Return false for invalid patterns (don't throw)

## Performance Considerations

### Pattern Matching

- Cache compiled glob patterns (minimatch instances)
- Early exit on exclusions
- Optimize for common case (file mode, single pattern)

### Config Resolution

- Lazy resolution (only when needed)
- Cache resolved configs
- Detect circular extends early

### Memory

- Avoid copying large objects unnecessarily
- Use structural sharing where possible
- Clean up caches when not needed

### Bundle Size

- Tree-shakeable exports
- No unnecessary dependencies
- Keep minimal runtime footprint
- Target: < 10KB minified + gzipped

## Future Enhancements

(Out of scope for v1)

1. **Performance**
   - Parallel validation
   - Incremental validation
   - Pattern compilation caching

2. **Features**
   - Custom validators
   - Rule templates
   - Boundary inheritance
   - Conditional rules

3. **Debugging**
   - Visual config debugger
   - Rule coverage analysis
   - Pattern testing utilities

4. **Schema**
   - JSON Schema export
   - Schema versioning
   - Migration tools

5. **Advanced Patterns**
   - Regex patterns (in addition to globs)
   - Negative patterns (match except)
   - Dynamic boundaries (function-based)
