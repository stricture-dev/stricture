# @stricture/eslint-plugin - Technical Specification

## Overview

`@stricture/eslint-plugin` is an ESLint plugin that enforces architectural boundaries by analyzing import statements in JavaScript and TypeScript files. It reads configuration from `.stricture/config.json`, classifies files into boundaries, and validates that imports respect the defined architectural rules.

## Responsibilities

- Implement ESLint plugin with `enforce-boundaries` rule
- **Delegate all validation logic to `@stricture/core`**
- Load and parse `.stricture/config.json` at lint time
- Extract import information from AST nodes
- Resolve import specifiers to absolute paths (via `core`)
- Call `validateImport()` from core for each import
- Report violations returned by core with ESLint formatting
- Support both legacy and flat ESLint configurations
- Cache configuration for performance
- Support dynamic imports and re-exports

**Key principle**: This is a **thin wrapper** around `@stricture/core`. All architectural logic lives in core.

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
│   │   ├── enforce-boundaries.ts   // Main rule (delegates to core)
│   │   └── utils/
│   │       ├── load-config.ts      // Load .stricture/config.json
│   │       ├── load-tsconfig.ts    // Load tsconfig paths
│   │       └── format-error.ts     // Format errors for ESLint
│   ├── config/
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

**Note**: Much simpler than before because validation logic is in core.

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
  const options = context.options[0] || {}
  const config = loadConfig(options.configPath || '.stricture/config.json')

  // 2. Load tsconfig paths if available (for alias resolution)
  const tsconfigPaths = loadTsconfigPaths(context.getCwd())

  // 3. Get source file
  const sourceFile = context.getFilename()

  // 4. Return AST visitors
  return {
    // Check static imports: import X from 'Y'
    ImportDeclaration(node) {
      checkImportNode(node, node.source.value, context, config, tsconfigPaths)
    },

    // Check require: require('X')
    CallExpression(node) {
      if (node.callee.name === 'require' && node.arguments[0]) {
        checkImportNode(node, node.arguments[0].value, context, config, tsconfigPaths)
      }

      // Check dynamic imports: import('X')
      if (node.callee.type === 'Import' && node.arguments[0]) {
        checkImportNode(node, node.arguments[0].value, context, config, tsconfigPaths)
      }
    },

    // Check re-exports: export { X } from 'Y'
    ExportNamedDeclaration(node) {
      if (node.source) {
        checkImportNode(node, node.source.value, context, config, tsconfigPaths)
      }
    },

    // Check export all: export * from 'Y'
    ExportAllDeclaration(node) {
      checkImportNode(node, node.source.value, context, config, tsconfigPaths)
    }
  }
}

function checkImportNode(
  node: ESLint.Node,
  importSpecifier: string,
  context: ESLint.RuleContext,
  config: StrictureConfig,
  tsconfigPaths: Record<string, string[]> | null
) {
  const sourceFile = context.getFilename()
  const projectRoot = context.getCwd()

  // 1. Resolve import to absolute path using CORE
  const resolvedPath = resolveImportPath(
    sourceFile,
    importSpecifier,
    projectRoot,
    tsconfigPaths
  )

  // 2. Validate import using CORE
  const result = validateImport(
    sourceFile,
    resolvedPath,
    config.rules,
    config.boundaries
  )

  // 3. Report if invalid
  if (!result.valid) {
    context.report({
      node,
      messageId: 'boundaryViolation',
      data: {
        from: result.fromBoundary || 'unknown',
        to: result.toBoundary || 'unknown',
        rule: result.violatedRule?.name
      },
      message: formatErrorMessage(result)
    })
  }
}
```

#### Integration with Core

All validation logic is delegated to `@stricture/core`:

```typescript
import {
  validateImport,      // Main validation function
  resolveImportPath,   // Path resolution
  type StrictureConfig,
  type ImportValidationResult
} from '@stricture/core'

// ESLint plugin just:
// 1. Extracts import info from AST
// 2. Calls core functions
// 3. Formats errors for ESLint
```

**Why this approach**:
- Single source of truth for validation logic
- Core can be used standalone (CLI, pre-commit hooks, etc.)
- Easier to test validation logic
- Consistent behavior across all tools

#### Handling External Dependencies

External dependencies (node_modules) are handled by core's `validateImport()`:

```typescript
// Example: Block externals in domain
const config = {
  rules: [
    {
      id: 'domain-pure',
      from: { tag: 'domain' },
      to: { tag: 'external' },  // Special tag from core
      allowed: false
    }
  ]
}

// This import will be validated:
import { z } from 'zod'  // Resolved to 'node_modules/zod/...'
// Core will detect it's external and check rules
```

**The plugin doesn't need to know about externals** - core handles it.

#### Error Message Formatting

```typescript
function formatErrorMessage(result: ImportValidationResult): string {
  // Core already provides a good message
  let message = result.message

  // Add suggestion if available
  if (result.suggestion) {
    message += `\n\nSuggestion: ${result.suggestion}`
  }

  // Add violated rule info
  if (result.violatedRule) {
    message += `\n\nRule: ${result.violatedRule.name} (${result.violatedRule.id})`

    if (result.violatedRule.examples?.good) {
      message += '\n\nAllowed:'
      result.violatedRule.examples.good.forEach(ex => {
        message += `\n  ✓ ${ex}`
      })
    }
  }

  return message
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

- **@stricture/core** (workspace:*) - Core validation engine and types
- **@typescript-eslint/utils** (^6.19.0) - ESLint utilities
- **tsconfig-paths** (^4.2.0) - For loading tsconfig path aliases

**Note**: The heavy lifting is done by `@stricture/core`. This plugin is just ESLint integration.

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

Test ESLint integration (not validation logic - that's in core):

1. **Config loading**
   - Config loaded correctly
   - Config cached
   - Invalid config reported

2. **AST node handling**
   - ImportDeclaration nodes processed
   - CallExpression (require, dynamic import) processed
   - Export declarations processed

3. **Error reporting**
   - Violations reported to ESLint correctly
   - Messages formatted properly
   - Node location correct

4. **tsconfig paths**
   - Paths loaded correctly
   - Aliases resolved via paths
   - Falls back gracefully if no tsconfig

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
