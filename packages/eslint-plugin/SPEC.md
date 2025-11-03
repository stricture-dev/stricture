# @stricture/eslint-plugin - Technical Specification

## Overview

`@stricture/eslint-plugin` is an ESLint plugin that enforces architectural boundaries by analyzing import statements in JavaScript and TypeScript files. It reads configuration from `.stricture/config.json`, classifies files into boundaries, and validates that imports respect the defined architectural rules.

## Responsibilities

- Implement ESLint plugin with `enforce-boundaries` rule
- Load and parse `.stricture/config.json` at lint time
- Classify each file into appropriate boundary based on patterns
- Validate import/require statements against boundary rules
- Report violations with clear, actionable error messages
- Support both legacy and flat ESLint configurations
- Cache configuration and pattern matching for performance
- Support dynamic imports and re-exports

## API Surface

### Plugin Exports

```typescript
// Main plugin export
export default {
  meta: {
    name: '@stricture/eslint-plugin',
    version: '0.1.0'
  },
  rules: {
    'enforce-boundaries': enforceBoundariesRule
  },
  configs: {
    recommended: {
      plugins: ['@stricture'],
      rules: {
        '@stricture/enforce-boundaries': 'error'
      }
    }
  }
}
```

### Rule: `enforce-boundaries`

**Schema**:

```typescript
interface RuleOptions {
  configPath?: string           // Path to .stricture/config.json (default: '.stricture/config.json')
  baseUrl?: string              // Base URL for path resolution (default: './')
  checkDynamicImports?: boolean // Check import() expressions (default: true)
  reportUnusedRules?: boolean   // Warn if rules never match (default: false)
}
```

**Rule meta**:

```typescript
{
  type: 'problem',
  docs: {
    description: 'Enforce architectural boundaries',
    category: 'Possible Errors',
    recommended: true,
    url: 'https://stricture.dev/docs/rules/enforce-boundaries'
  },
  schema: [
    {
      type: 'object',
      properties: {
        configPath: { type: 'string' },
        baseUrl: { type: 'string' },
        checkDynamicImports: { type: 'boolean' },
        reportUnusedRules: { type: 'boolean' }
      },
      additionalProperties: false
    }
  ],
  messages: {
    boundaryViolation: 'Import from "{{to}}" boundary not allowed in "{{from}}" boundary',
    noBoundaryMatch: 'File does not match any defined boundary',
    configLoadError: 'Failed to load .stricture/config.json: {{error}}'
  }
}
```

### Internal Types

```typescript
interface ClassificationResult {
  filePath: string
  boundary: BoundaryDefinition | null
  matched: boolean
}

interface ValidationContext {
  config: StrictureConfig
  sourceFile: string
  sourceBoundary: BoundaryDefinition | null
  importSpecifier: string
  resolvedImportPath: string
}

interface ViolationReport {
  rule: ArchRule
  from: BoundaryDefinition
  to: BoundaryDefinition
  importSpecifier: string
  message: string
  suggestions?: string[]
}
```

## Implementation Approach

### Key Files

```
packages/eslint-plugin/
├── src/
│   ├── index.ts                    // Plugin entry point
│   ├── rules/
│   │   ├── enforce-boundaries.ts   // Main rule implementation
│   │   └── utils/
│   │       ├── classify-file.ts    // Classify files into boundaries
│   │       ├── resolve-import.ts   // Resolve import paths
│   │       ├── check-violation.ts  // Check if import violates rules
│   │       └── format-error.ts     // Format error messages
│   ├── config/
│   │   ├── load-config.ts          // Load .stricture/config.json
│   │   └── config-cache.ts         // Cache loaded configs
│   └── types/
│       └── eslint.ts               // ESLint type augmentations
├── tests/
│   ├── rules/
│   │   └── enforce-boundaries.test.ts
│   └── fixtures/
│       ├── valid/
│       └── invalid/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── SPEC.md
```

### Architecture

**Plugin structure** (simplified - most logic is in core):
1. **Plugin registration** (`index.ts`) - Exports plugin with rules
2. **Rule implementation** (`rules/enforce-boundaries.ts`) - ESLint rule logic
   - Extracts import info from AST nodes
   - Calls `resolveImportPath()` from core
   - Calls `validateImport()` from core
   - Formats errors for ESLint
3. **Configuration loading** (`config/load-config.ts`) - Load .stricture/config.json
4. **Configuration caching** (`config/config-cache.ts`) - Cache configs
5. **tsconfig loading** (`config/load-tsconfig.ts`) - Load TypeScript path aliases
6. **Error formatting** (`utils/format-error.ts`) - Format core errors for ESLint

**What's NOT in this plugin** (it's in `@stricture/core`):
- ❌ File classification logic → Use core's `validateImport()` which handles this internally
- ❌ Import resolution logic → Use core's `resolveImportPath()`
- ❌ Rule checking logic → Use core's `validateImport()`
- ❌ Pattern matching → Core handles this

**Design patterns**:
- **Singleton cache** for configuration (reload only when file changes)
- **Delegation pattern** for all validation (delegate to core)
- **Adapter pattern** for ESLint integration (adapt core's API to ESLint's)
- **Lazy loading** of configuration (only when needed)

### Algorithm/Logic

#### Main Rule Flow

```typescript
function create(context: ESLint.RuleContext) {
  // 1. Load configuration (cached)
  const config = loadConfig(context.options[0]?.configPath)

  // 2. Classify source file
  const sourceFile = context.getFilename()
  const sourceBoundary = classifyFile(sourceFile, config.boundaries)

  // 3. Return AST visitors
  return {
    // Check static imports: import X from 'Y'
    ImportDeclaration(node) {
      checkImport(node.source.value, context, config, sourceBoundary)
    },

    // Check require: require('X')
    CallExpression(node) {
      if (node.callee.name === 'require') {
        checkImport(node.arguments[0].value, context, config, sourceBoundary)
      }

      // Check dynamic imports: import('X')
      if (node.callee.type === 'Import') {
        checkImport(node.arguments[0].value, context, config, sourceBoundary)
      }
    },

    // Check re-exports: export { X } from 'Y'
    ExportNamedDeclaration(node) {
      if (node.source) {
        checkImport(node.source.value, context, config, sourceBoundary)
      }
    },

    // Check export all: export * from 'Y'
    ExportAllDeclaration(node) {
      checkImport(node.source.value, context, config, sourceBoundary)
    }
  }
}
```

#### File Classification Algorithm

```typescript
function classifyFile(
  filePath: string,
  boundaries: BoundaryDefinition[]
): BoundaryDefinition | null {
  // Normalize path
  const normalizedPath = normalizePath(filePath)

  // Try each boundary in order
  for (const boundary of boundaries) {
    // Check exclusions first
    if (boundary.exclude) {
      for (const exclude of boundary.exclude) {
        if (matchesPattern(normalizedPath, { pattern: exclude, mode: boundary.mode })) {
          continue // Skip this boundary
        }
      }
    }

    // Check pattern match
    if (matchesPattern(normalizedPath, {
      pattern: boundary.pattern,
      mode: boundary.mode
    })) {
      return boundary
    }
  }

  return null // No boundary matched
}
```

#### Import Validation Algorithm

```typescript
function checkImport(
  importSpecifier: string,
  context: ESLint.RuleContext,
  config: StrictureConfig,
  sourceBoundary: BoundaryDefinition | null
) {
  // 1. Skip if source file not in any boundary
  if (!sourceBoundary) return

  // 2. Resolve import to absolute path
  const resolvedPath = resolveImport(importSpecifier, context.getFilename())

  // 3. Skip external packages (node_modules)
  if (isExternalModule(resolvedPath)) return

  // 4. Classify import target
  const targetBoundary = classifyFile(resolvedPath, config.boundaries)

  // 5. Skip if target not in any boundary
  if (!targetBoundary) return

  // 6. Check rules
  for (const rule of config.rules) {
    const violation = checkRule(rule, sourceBoundary, targetBoundary)

    if (violation) {
      // 7. Report violation
      context.report({
        node,
        messageId: 'boundaryViolation',
        data: {
          from: sourceBoundary.name,
          to: targetBoundary.name
        },
        message: formatViolation(violation, rule)
      })

      return // Only report first violation
    }
  }
}
```

#### Rule Checking Algorithm

```typescript
function checkRule(
  rule: ArchRule,
  from: BoundaryDefinition,
  to: BoundaryDefinition
): boolean {
  // 1. Check if 'from' matches source
  const fromMatches = matchesBoundary(from, rule.from)
  if (!fromMatches) return false

  // 2. Check if 'to' matches target
  const toMatches = matchesBoundary(to, rule.to)
  if (!toMatches) return false

  // 3. Return violation status (true if not allowed)
  return !rule.allowed
}

function matchesBoundary(
  boundary: BoundaryDefinition,
  pattern: BoundaryPattern
): boolean {
  // Pattern can specify:
  // - tag: match by boundary name/tag
  // - pattern: match by glob
  // - wildcard: match all (pattern: '**')

  if (pattern.tag) {
    return boundary.name === pattern.tag ||
           boundary.tags?.includes(pattern.tag)
  }

  if (pattern.pattern === '**') {
    return true // Wildcard matches all
  }

  if (pattern.pattern) {
    return matchesPattern(boundary.pattern, pattern)
  }

  return false
}
```

#### Error Message Formatting

```typescript
function formatViolation(
  violation: ViolationReport,
  rule: ArchRule
): string {
  const lines = []

  lines.push(`Import from "${violation.to.name}" boundary not allowed in "${violation.from.name}" boundary`)
  lines.push('')
  lines.push(`Rule: ${rule.name} (${rule.id})`)
  lines.push(`From: ${violation.from.name} (${violation.from.pattern})`)
  lines.push(`To:   ${violation.to.name} (${violation.to.pattern})`)

  if (rule.message) {
    lines.push('')
    lines.push(rule.message)
  }

  if (rule.examples?.good) {
    lines.push('')
    lines.push('Allowed imports:')
    rule.examples.good.forEach(ex => lines.push(`  ✓ ${ex}`))
  }

  if (rule.examples?.bad) {
    lines.push('')
    lines.push('Disallowed imports:')
    rule.examples.bad.forEach(ex => lines.push(`  ✗ ${ex}`))
  }

  return lines.join('\n')
}
```

### Configuration Caching

```typescript
class ConfigCache {
  private cache = new Map<string, {
    config: StrictureConfig
    mtime: number
  }>()

  get(configPath: string): StrictureConfig {
    const absolutePath = path.resolve(configPath)
    const cached = this.cache.get(absolutePath)

    // Check if file changed
    const stats = fs.statSync(absolutePath)

    if (cached && cached.mtime === stats.mtimeMs) {
      return cached.config
    }

    // Load and cache
    const config = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
    this.cache.set(absolutePath, {
      config,
      mtime: stats.mtimeMs
    })

    return config
  }

  clear() {
    this.cache.clear()
  }
}

const configCache = new ConfigCache()
```

## Dependencies

### Runtime Dependencies

- **@stricture/core** (workspace:*) - Core types and utilities
- **@typescript-eslint/utils** (^6.19.0) - ESLint utilities for TypeScript

### Dev Dependencies

- **typescript** (^5.3.0)
- **tsup** (^8.0.0)
- **vitest** (^1.2.0)
- **@typescript-eslint/parser** (^6.19.0) - For testing
- **eslint** (^8.56.0) - For testing
- **@stricture/typescript-config** (workspace:*)
- **@stricture/eslint-config** (workspace:*)

### Peer Dependencies

- **eslint** (^8.0.0 || ^9.0.0)

## Testing Strategy

### Unit Tests

Test individual functions:
1. **File classification**
   - Files match correct boundaries
   - Exclusions work
   - Multiple boundaries prioritized correctly

2. **Import resolution**
   - Relative imports resolved
   - Absolute imports resolved
   - External modules detected

3. **Rule checking**
   - Rules match correctly
   - Tag-based rules work
   - Pattern-based rules work
   - Wildcard rules work

4. **Error formatting**
   - Messages formatted correctly
   - Examples included when present
   - Multi-line messages work

### Integration Tests (ESLint RuleTester)

Test complete rule behavior:

```typescript
import { RuleTester } from 'eslint'
import rule from '../src/rules/enforce-boundaries'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser')
})

ruleTester.run('enforce-boundaries', rule, {
  valid: [
    {
      code: `import { User } from './user'`,
      filename: 'src/domain/index.ts',
      options: [{ configPath: 'fixtures/hexagonal-config.json' }]
    }
  ],
  invalid: [
    {
      code: `import { api } from '../../adapters/api'`,
      filename: 'src/domain/user.ts',
      options: [{ configPath: 'fixtures/hexagonal-config.json' }],
      errors: [
        {
          messageId: 'boundaryViolation',
          data: { from: 'domain', to: 'adapters' }
        }
      ]
    }
  ]
})
```

### Fixture-Based Tests

Test against realistic project structures:

```
tests/fixtures/
├── hexagonal/
│   ├── .stricture/
│   │   └── config.json
│   └── src/
│       ├── domain/
│       ├── ports/
│       └── adapters/
├── layered/
├── modular/
└── nextjs/
```

### Test Coverage Goals

- **Lines**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Statements**: > 90%

### Test Files

```
tests/
├── rules/
│   ├── enforce-boundaries.test.ts    // Main rule tests
│   └── enforce-boundaries.edge.test.ts
├── config/
│   ├── load-config.test.ts
│   ├── config-cache.test.ts
│   └── load-tsconfig.test.ts         // Test tsconfig loading
├── utils/
│   └── format-error.test.ts          // Test error formatting
└── fixtures/
    ├── hexagonal-config.json
    ├── layered-config.json
    └── projects/
        ├── hexagonal/
        └── layered/
```

**Note**: Tests for classification, resolution, and validation logic are in `@stricture/core` tests.

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
  external: ['eslint', '@typescript-eslint/utils']
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

Rule options (passed in ESLint config):

```typescript
{
  configPath: '.stricture/config.json',  // Default
  baseUrl: './',                         // Default
  checkDynamicImports: true,             // Default
  reportUnusedRules: false               // Default
}
```

## Error Handling

### Configuration Errors

- **Missing config file**: Report as ESLint error with suggestion to run `npx stricture init`
- **Invalid JSON**: Report syntax error with line/column
- **Invalid schema**: Report validation errors with details

### Runtime Errors

- **Path resolution failures**: Skip import (don't crash)
- **Pattern matching errors**: Log warning, continue
- **Circular imports**: Detect and report
- **File system errors**: Graceful degradation

### Error Reporting Strategy

```typescript
try {
  const config = loadConfig(configPath)
} catch (err) {
  context.report({
    loc: { line: 1, column: 0 },
    messageId: 'configLoadError',
    data: {
      error: err.message
    }
  })
  return {} // Return empty visitor (disable rule)
}
```

## Performance Considerations

### Optimization Strategies

1. **Config caching**
   - Load config once per ESLint run
   - Cache based on file mtime
   - Share cache across rule instances

2. **Pattern compilation**
   - Compile glob patterns once
   - Cache compiled minimatch instances
   - Reuse across files

3. **Early exit**
   - Skip external modules immediately
   - Skip files not in any boundary
   - Stop at first rule violation

4. **Lazy resolution**
   - Only resolve imports when needed
   - Cache resolution results per file
   - Clear cache after file processed

### Performance Targets

- **Config load**: < 10ms
- **File classification**: < 1ms per file
- **Import check**: < 5ms per import
- **Total overhead**: < 5% of lint time

### Memory Management

- Limit cache size (LRU eviction if needed)
- Clear caches between ESLint runs
- Share data structures where possible

## Future Enhancements

(Out of scope for v1)

1. **Auto-fix**
   - Suggest alternative imports
   - Refactor to use correct boundaries
   - Add type imports when needed

2. **Advanced Features**
   - Type-only import exemptions
   - Conditional rules (environment-based)
   - Rule severity overrides per file
   - Import suggestions via LSP

3. **Performance**
   - Multi-threaded boundary checking
   - Incremental validation
   - Watch mode optimization

4. **Developer Experience**
   - Interactive rule builder
   - Visual boundary map in IDE
   - Rule testing framework
   - Debug mode with detailed logging

5. **Integration**
   - VSCode extension
   - Webpack plugin
   - Vite plugin
   - Jest integration
