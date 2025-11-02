# @stricture/core

Core types, interfaces, and utilities for Stricture architecture boundary enforcement.

## Installation

```bash
npm install @stricture/core
```

**Note**: You typically don't need to install this directly. It's included as a dependency when you install any Stricture preset package.

## What is this?

`@stricture/core` provides the foundational TypeScript types and utilities that all Stricture packages depend on. It defines:

- Architecture rule schemas
- Boundary pattern definitions
- Configuration structures
- Validation utilities
- Common types used across all presets

## Usage

### Validating Imports (Main Use Case)

This is the core functionality used by `@stricture/eslint-plugin`:

```typescript
import { validateImport, resolveImportPath } from '@stricture/core'
import { hexagonalRules, hexagonalBoundaries } from '@stricture/hexagonal'

// In an ESLint rule or custom validator
const fromFile = '/project/src/core/domain/user.ts'
const importSpec = '../../../adapters/database/user-repo'

// 1. Resolve the import to absolute path
const toFile = resolveImportPath(fromFile, importSpec, '/project')
// toFile = '/project/src/adapters/database/user-repo.ts'

// 2. Validate the import
const result = validateImport(fromFile, toFile, hexagonalRules, hexagonalBoundaries)

if (!result.valid) {
  console.error(`❌ Architecture violation:`)
  console.error(`   ${result.message}`)
  console.error(`   Suggestion: ${result.suggestion}`)
}
```

### Using Types

```typescript
import type { ArchRule, ArchPreset, BoundaryPattern } from '@stricture/core'

const myRule: ArchRule = {
  id: 'no-domain-imports',
  name: 'Domain Isolation',
  description: 'Domain layer cannot import external dependencies',
  severity: 'error',
  from: { pattern: 'src/domain/**', mode: 'file' },
  to: { pattern: '**', mode: 'file' },
  allowed: false,
  message: 'Domain must remain pure'
}
```

### Validating Configuration

```typescript
import { validateConfig, validateRule } from '@stricture/core'

const config = {
  preset: '@stricture/hexagonal',
  boundaries: [...],
  rules: [...]
}

const result = validateConfig(config)
if (!result.valid) {
  console.error('Invalid config:', result.errors)
}
```

## Core Types

### `ArchRule`

Defines a single architectural boundary rule.

```typescript
interface ArchRule {
  id: string                    // Unique identifier
  name: string                  // Human-readable name
  description: string           // What this rule enforces
  severity: 'error' | 'warn'    // Violation severity
  from: BoundaryPattern         // Source boundary
  to: BoundaryPattern           // Target boundary
  allowed: boolean              // Whether import is allowed
  message?: string              // Custom error message
  examples?: {                  // Code examples
    good: string[]
    bad: string[]
  }
}
```

### `BoundaryPattern`

Defines a boundary using glob patterns or tags.

```typescript
interface BoundaryPattern {
  pattern?: string              // Glob pattern (e.g., 'src/domain/**')
  tag?: string                  // Boundary tag (e.g., 'domain')
  mode: 'file' | 'folder'       // Matching mode
  exclude?: string[]            // Exclusion patterns
}
```

### `ArchPreset`

Complete architecture preset definition.

```typescript
interface ArchPreset {
  id: string                    // Preset identifier
  name: string                  // Display name
  description: string           // What architecture this represents
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  diagram?: DiagramDefinition   // Visual representation
  scaffolding?: ScaffoldingTemplate
}
```

### `StrictureConfig`

Project configuration schema.

```typescript
interface StrictureConfig {
  preset: string                // Preset package name
  extends?: string[]            // Additional presets
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
  overrides?: ArchRule[]        // Rule overrides
  ignorePatterns?: string[]     // Files to ignore
}
```

## Utilities

### `validateConfig(config: unknown): ValidationResult`

Validates a Stricture configuration object.

```typescript
const result = validateConfig(config)
// result = { valid: boolean, errors: string[] }
```

### `validateRule(rule: unknown): ValidationResult`

Validates a single architecture rule.

```typescript
const result = validateRule(rule)
// result = { valid: boolean, errors: string[] }
```

### `matchesPattern(filePath: string, pattern: BoundaryPattern): boolean`

Checks if a file path matches a boundary pattern.

```typescript
const matches = matchesPattern(
  'src/domain/user.ts',
  { pattern: 'src/domain/**', mode: 'file' }
)
// matches = true
```

### `mergeBoundaries(base: BoundaryDefinition[], override: BoundaryDefinition[]): BoundaryDefinition[]`

Merges boundary definitions, useful when extending presets.

```typescript
const merged = mergeBoundaries(baseBoundaries, customBoundaries)
```

## Examples

### Creating a Custom Preset

```typescript
import type { ArchPreset } from '@stricture/core'

export const myPreset: ArchPreset = {
  id: 'my-architecture',
  name: 'My Custom Architecture',
  description: 'Custom architectural boundaries',
  boundaries: [
    {
      name: 'core',
      pattern: 'src/core/**',
      mode: 'file',
      tags: ['core']
    },
    {
      name: 'features',
      pattern: 'src/features/**',
      mode: 'folder',
      tags: ['feature']
    }
  ],
  rules: [
    {
      id: 'core-isolation',
      name: 'Core Isolation',
      description: 'Core cannot depend on features',
      severity: 'error',
      from: { tag: 'core' },
      to: { tag: 'feature' },
      allowed: false
    }
  ]
}
```

### Runtime Config Validation

```typescript
import { validateConfig } from '@stricture/core'
import fs from 'fs'

const configFile = fs.readFileSync('.stricture/config.json', 'utf-8')
const config = JSON.parse(configFile)

const validation = validateConfig(config)

if (!validation.valid) {
  console.error('Configuration errors:')
  validation.errors.forEach(err => console.error(`  - ${err}`))
  process.exit(1)
}
```

## API Reference

For complete API documentation, visit [stricture.dev/docs/api/core](https://stricture.dev/docs/api/core)

## TypeScript Support

This package is written in TypeScript and provides full type definitions. No `@types` package needed.

```typescript
import type {
  ArchRule,
  ArchPreset,
  BoundaryPattern,
  BoundaryDefinition,
  StrictureConfig,
  ValidationResult,
  DiagramDefinition,
  ScaffoldingTemplate
} from '@stricture/core'
```

## License

MIT
