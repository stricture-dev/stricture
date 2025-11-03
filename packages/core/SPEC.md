# @stricture/core - Technical Specification

## Overview

`@stricture/core` is the foundational package for the Stricture ecosystem. It provides zero-dependency TypeScript types, interfaces, schemas, and utilities that all other Stricture packages depend on. This package defines the contract for how architectural boundaries are specified, validated, and enforced.

## Responsibilities

- **Implement the core import validation engine** (validateImport - the main function)
- Resolve import specifiers to absolute paths
- Define core TypeScript types for architectural rules and boundaries
- Provide configuration schema for `.stricture/config.json`
- Export validation utilities for rules and configurations
- Define preset interfaces that architecture packages implement
- Provide pattern matching utilities for file paths and boundaries
- Maintain minimal runtime dependencies

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

#### Special Boundary Tags

**`'external'` tag**: Reserved tag for external dependencies (node_modules)

```typescript
// Example rule: Domain cannot import external libraries
{
  id: 'domain-no-externals',
  from: { tag: 'domain' },
  to: { tag: 'external' },    // Matches any node_modules import
  allowed: false
}

// Example rule: Domain CAN import specific type-only libraries
{
  id: 'domain-allow-types',
  from: { tag: 'domain' },
  to: { pattern: 'node_modules/@types/**' },
  allowed: true
}
```

**Note**: If no rule targets `external`, external dependencies are allowed by default.

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
Result of configuration/rule validation operations.

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

#### `ImportValidationResult`
Result of import validation (different from config validation).

```typescript
interface ImportValidationResult {
  valid: boolean
  violatedRule?: ArchRule         // The rule that was violated
  fromBoundary?: string           // Source boundary name
  toBoundary?: string             // Target boundary name
  message?: string                // Human-readable error message
  suggestion?: string             // Suggested fix
}
```

### Functions

#### `validateImport(fromPath: string, toPath: string, rules: ArchRule[], boundaries: BoundaryDefinition[]): ImportValidationResult`

**This is the core validation engine** - validates whether an import statement violates architectural rules.

```typescript
export function validateImport(
  fromPath: string,        // Absolute path of file doing the import
  toPath: string,          // Absolute path being imported (resolved)
  rules: ArchRule[],       // Rules to check against
  boundaries: BoundaryDefinition[]  // Boundary definitions for tag resolution
): ImportValidationResult
```

**Returns**:
```typescript
interface ImportValidationResult {
  valid: boolean
  violatedRule?: ArchRule
  message?: string
  suggestion?: string       // Suggested fix
}
```

**Algorithm**:
1. Detect if `toPath` is an external dependency (node_modules)
2. Find which boundary `fromPath` belongs to
3. Find which boundary `toPath` belongs to (null if external dependency)
4. Check all applicable rules where `from` matches source boundary
5. For external dependencies, check if there's a rule targeting external imports
6. If rule's `to` matches target boundary (or external), check if `allowed`
7. Return violation with helpful message if not allowed

**Note on external dependencies**:
- External dependencies (node_modules) can be controlled via rules
- Use a special boundary pattern to target externals: `{ tag: 'external' }`
- Example: Prevent domain from importing any external libraries

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

#### `resolveImportPath(fromPath: string, importSpecifier: string, baseDir: string, tsconfigPaths?: Record<string, string[]>): string`

Resolves an import specifier to an absolute file path.

```typescript
export function resolveImportPath(
  fromPath: string,          // File doing the import
  importSpecifier: string,   // Import string (e.g., '../domain/user', '@/core/domain')
  baseDir: string,          // Project root directory
  tsconfigPaths?: Record<string, string[]>  // Optional: tsconfig paths mapping
): string
```

**Handles**:
- **Relative imports**: `'../domain/user'` → resolve relative to fromPath
- **Path aliases**: `'@/core/domain'` → resolve via tsconfigPaths parameter
- **Node modules**: `'lodash'` → return as `'node_modules/lodash'` (marked as external)
- **Extensions**: Add `.ts`, `.tsx`, `.js` if missing and file exists

**Path alias resolution**:
```typescript
// Consumers can use tsconfig-paths library to load paths
import { loadConfig, createMatchPath } from 'tsconfig-paths'

const { paths, baseUrl } = loadConfig('./tsconfig.json')
const matchPath = createMatchPath(baseUrl, paths)

const resolved = resolveImportPath(
  fromPath,
  importSpec,
  baseDir,
  paths  // Pass tsconfig paths
)
```

**External detection**:
- If import doesn't start with `.` or `/` and isn't in tsconfigPaths → external
- Return `node_modules/{importSpecifier}` to mark as external

This is critical for the ESLint plugin to convert import specifiers to paths.

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
- Uses micromatch for glob pattern matching
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
  type ImportValidationResult,

  // Utilities
  validateConfig,
  validateRule,
  validateBoundary,
  validateImport,
  resolveImportPath,
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
│   │   └── validation.ts        // Both ValidationResult types
│   ├── validation/
│   │   ├── validate-config.ts
│   │   ├── validate-rule.ts
│   │   ├── validate-boundary.ts
│   │   ├── validate-import.ts   // Core import validation function
│   │   └── validators.ts        // Shared validation helpers
│   ├── matching/
│   │   ├── match-pattern.ts
│   │   └── glob-utils.ts
│   ├── resolution/
│   │   ├── resolve-import.ts    // resolveImportPath()
│   │   └── path-utils.ts
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
- `validation/` - Runtime validation logic (includes core import validation)
- `matching/` - Pattern matching algorithms
- `resolution/` - Import path resolution utilities
- `merging/` - Configuration merging logic

**Design principles**:
- Minimal runtime dependencies (only micromatch for glob matching)
- Pure functions (no side effects)
- Immutable data structures
- Fail-fast validation
- Detailed error messages

### Algorithm/Logic

#### Import Validation Algorithm

```typescript
function validateImport(fromPath, toPath, rules, boundaries) {
  // 1. Detect if target is external dependency
  const isExternal = toPath.includes('node_modules') ||
                     !toPath.startsWith(projectRoot)

  // 2. Find source boundary
  const fromBoundary = boundaries.find(b =>
    matchesPattern(fromPath, { pattern: b.pattern, mode: b.mode })
  )

  // 3. Find target boundary (null if external)
  const toBoundary = isExternal
    ? { name: 'external', pattern: 'node_modules/**', mode: 'file' as const }
    : boundaries.find(b =>
        matchesPattern(toPath, { pattern: b.pattern, mode: b.mode })
      )

  // 4. Check all applicable rules
  for (const rule of rules) {
    const fromMatches = matchesRuleBoundary(fromBoundary, rule.from, boundaries)
    const toMatches = matchesRuleBoundary(toBoundary, rule.to, boundaries)

    if (fromMatches && toMatches) {
      if (!rule.allowed) {
        return {
          valid: false,
          violatedRule: rule,
          fromBoundary: fromBoundary?.name,
          toBoundary: toBoundary?.name,
          message: rule.message || buildMessage(fromBoundary, toBoundary, isExternal),
          suggestion: generateSuggestion(rule, isExternal)
        }
      }
    }
  }

  // 5. No violations found (or no rule targets this combination)
  return { valid: true }
}

function buildMessage(from, to, isExternal) {
  if (isExternal) {
    return `${from?.name} cannot import external dependencies`
  }
  return `${from?.name} cannot import from ${to?.name}`
}

function matchesRuleBoundary(boundary, pattern, boundaries) {
  // Handle wildcard - matches ANY boundary including external
  if (pattern.pattern === '**' || pattern.tag === '*') {
    return true
  }

  // Handle special 'external' tag
  if (pattern.tag === 'external') {
    return boundary?.name === 'external'
  }

  // Handle tag matching
  if (pattern.tag) {
    return boundary?.name === pattern.tag || boundary?.tags?.includes(pattern.tag)
  }

  // Handle pattern matching
  return boundary && matchesPattern(boundary.pattern, pattern)
}
```

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
      if (micromatch.isMatch(filePath, exclude)) return false
    }
  }

  // 3. Check pattern match
  if (pattern.mode === 'folder') {
    // Match entire directory
    const dirPath = path.dirname(filePath)
    return micromatch.isMatch(dirPath, pattern.pattern)
  } else {
    // Match file
    return micromatch.isMatch(filePath, pattern.pattern)
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

#### External Dependencies Examples

**Allow externals by default** (no rule):
```typescript
// No rule targeting external → allowed
import { z } from 'zod'  // ✅ Valid (no rule blocks it)
```

**Block all externals in domain**:
```typescript
const rules = [{
  id: 'domain-pure',
  from: { tag: 'domain' },
  to: { tag: 'external' },
  allowed: false,
  message: 'Domain must not import external libraries'
}]

// In domain file:
import { z } from 'zod'  // ❌ Blocked by rule
```

**Allow specific externals**:
```typescript
const rules = [
  {
    id: 'domain-no-externals',
    from: { tag: 'domain' },
    to: { tag: 'external' },
    allowed: false
  },
  {
    id: 'domain-allow-types',
    from: { tag: 'domain' },
    to: { pattern: 'node_modules/@types/**' },  // More specific wins
    allowed: true
  }
]
```

**Wildcard usage**:
```typescript
const rules = [{
  id: 'domain-isolated',
  from: { tag: 'domain' },
  to: { tag: '*' },  // ANY boundary (including external)
  allowed: false
}]

// Domain cannot import ANYTHING except other domain files
```

## Dependencies

### Runtime Dependencies

- **micromatch** (^4.0.5) - Glob pattern matching
- **@types/micromatch** (^4.0.6) - TypeScript types

### Optional Peer Dependencies

- **tsconfig-paths** (^4.2.0) - For resolving TypeScript path aliases (optional, but recommended)

**Note**: `tsconfig-paths` is not a hard dependency. Users can pass resolved paths manually if they prefer.

### Dev Dependencies

- **typescript** (^5.3.0) - TypeScript compiler
- **tsup** (^8.0.0) - Build tool
- **vitest** (^1.2.0) - Testing framework
- **@stricture/typescript-config** (workspace:*) - Shared TypeScript config
- **@stricture/eslint-config** (workspace:*) - Shared ESLint config

## Testing Strategy

### Unit Tests

**Test coverage areas**:
1. **Import validation** (MOST CRITICAL)
   - Valid imports pass
   - Invalid imports fail with correct rule
   - Wildcard patterns work (`*` matches any boundary)
   - Tag matching works
   - Multiple rules interact correctly
   - Clear error messages generated
   - **External dependencies detection works**
   - **Rules can allow/block external dependencies**
   - **Special `external` tag targets node_modules**
   - **External dependencies allowed by default if no rule**

2. **Type validation**
   - Valid configurations pass
   - Invalid configurations fail with correct errors
   - Edge cases (empty arrays, missing fields, etc.)

3. **Pattern matching**
   - File patterns match correctly
   - Folder patterns match correctly
   - Exclusions work
   - Tag resolution works

4. **Merging logic**
   - Boundaries merge correctly
   - Rules merge correctly
   - Overrides apply correctly
   - Preset extension works

5. **Edge cases**
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

- Cache compiled glob patterns (micromatch instances)
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
