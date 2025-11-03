# @stricture/eslint-plugin

ESLint plugin that enforces software architecture boundaries by controlling import statements based on your chosen architectural pattern.

## Installation

```bash
npm install -D @stricture/eslint-plugin
```

**Note**: This plugin is typically installed automatically when you use a Stricture preset package (like `@stricture/hexagonal`).

## Usage

### Basic Setup

Add to your `.eslintrc.js` or `eslint.config.js`:

```javascript
// .eslintrc.js (Legacy config)
module.exports = {
  plugins: ['@stricture'],
  rules: {
    '@stricture/enforce-boundaries': 'error'
  }
}
```

```javascript
// eslint.config.js (Flat config)
import stricture from '@stricture/eslint-plugin'

export default [
  {
    plugins: {
      '@stricture': stricture
    },
    rules: {
      '@stricture/enforce-boundaries': 'error'
    }
  }
]
```

### Configuration File

Create `.stricture/config.json` in your project root:

```json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [
    {
      "name": "domain",
      "pattern": "src/core/domain/**",
      "mode": "file"
    },
    {
      "name": "adapters",
      "pattern": "src/adapters/**",
      "mode": "file"
    }
  ],
  "rules": [
    {
      "id": "no-domain-imports",
      "name": "Domain Isolation",
      "description": "Domain cannot import anything external",
      "severity": "error",
      "from": { "tag": "domain" },
      "to": { "pattern": "**" },
      "allowed": false,
      "message": "Domain layer must remain pure - no external dependencies"
    }
  ]
}
```

## Rules

### `@stricture/enforce-boundaries`

Enforces architectural boundary rules defined in your `.stricture/config.json`.

**When it triggers**:
- When an import statement violates a boundary rule
- When a file in one boundary tries to import from a forbidden boundary

**Error example**:

```typescript
// src/core/domain/user.ts
import { api } from '../../adapters/api'  // ❌ Error!
// @stricture/enforce-boundaries: Domain layer cannot import from adapters
// Domain must remain pure - no external dependencies
```

**Options**:

```javascript
{
  rules: {
    '@stricture/enforce-boundaries': ['error', {
      configPath: '.stricture/config.json',  // Path to config (default)
      baseUrl: './',                         // Base URL for resolving paths
      checkDynamicImports: true,             // Check dynamic imports (default: true)
      reportUnusedRules: false               // Warn about unused rules (default: false)
    }]
  }
}
```

## How It Works

1. **Configuration Loading**: Loads `.stricture/config.json` once when ESLint starts
2. **Import Analysis**: For each import statement, extracts the import path from the AST
3. **Path Resolution**: Resolves import specifiers to absolute paths (using `@stricture/core`)
4. **Boundary Validation**: Validates the import against architectural rules (using `@stricture/core`)
5. **Error Reporting**: Reports clear, actionable errors with suggestions

**Under the hood**: This plugin is a thin ESLint wrapper around `@stricture/core`, which contains all the validation logic. This means the same rules work consistently across ESLint, CLI tools, and any other integrations.

## Error Messages

Error messages include:

- **What rule was violated**
- **Why it's not allowed**
- **Which boundaries are involved**
- **Suggestions for fixing**

Example error:

```
src/core/domain/user.ts
  5:1  error  Import from 'adapters' boundary not allowed in 'domain' boundary

       Rule: Domain Isolation (no-domain-imports)
       From: domain (src/core/domain/**)
       To:   adapters (src/adapters/**)

       Domain layer must remain pure - no external dependencies.

       Suggestion: Import from ports instead (src/core/ports/**).

       @stricture/enforce-boundaries
```

## Examples

### Hexagonal Architecture

```json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [
    { "name": "domain", "pattern": "src/core/domain/**", "mode": "file" },
    { "name": "ports", "pattern": "src/core/ports/**", "mode": "file" },
    { "name": "application", "pattern": "src/core/application/**", "mode": "file" },
    { "name": "adapters", "pattern": "src/adapters/**", "mode": "file" }
  ],
  "rules": [
    {
      "id": "domain-isolation",
      "from": { "tag": "domain" },
      "to": { "pattern": "**" },
      "allowed": false,
      "severity": "error"
    },
    {
      "id": "adapters-via-ports",
      "from": { "tag": "adapters" },
      "to": { "tag": "domain" },
      "allowed": false,
      "severity": "error"
    }
  ]
}
```

### Layered Architecture

```json
{
  "preset": "@stricture/layered",
  "boundaries": [
    { "name": "presentation", "pattern": "src/presentation/**", "mode": "file" },
    { "name": "application", "pattern": "src/application/**", "mode": "file" },
    { "name": "domain", "pattern": "src/domain/**", "mode": "file" },
    { "name": "infrastructure", "pattern": "src/infrastructure/**", "mode": "file" }
  ],
  "rules": [
    {
      "id": "no-layer-skipping",
      "from": { "tag": "presentation" },
      "to": { "tag": "domain" },
      "allowed": false,
      "severity": "error",
      "message": "Presentation layer must go through Application layer"
    }
  ]
}
```

### Modular Architecture

```json
{
  "preset": "@stricture/modular",
  "boundaries": [
    {
      "name": "auth-public",
      "pattern": "src/features/auth/index.ts",
      "mode": "file"
    },
    {
      "name": "auth-internal",
      "pattern": "src/features/auth/**",
      "mode": "file",
      "exclude": ["src/features/auth/index.ts"]
    }
  ],
  "rules": [
    {
      "id": "no-internal-imports",
      "from": { "pattern": "src/features/**" },
      "to": { "tag": "auth-internal" },
      "allowed": false,
      "severity": "error",
      "message": "Import from module's public API (index.ts) only"
    }
  ]
}
```

## Advanced Features

### Pattern Matching

Supports glob patterns:

```json
{
  "pattern": "src/**/*.model.ts",       // All model files
  "pattern": "src/{domain,ports}/**",   // Multiple directories
  "exclude": ["**/*.test.ts"]           // Exclude test files
}
```

### Tag-Based Rules

Use tags for cleaner rules:

```json
{
  "boundaries": [
    { "name": "core", "pattern": "src/core/**", "tags": ["core", "internal"] }
  ],
  "rules": [
    {
      "from": { "pattern": "src/features/**" },
      "to": { "tag": "internal" },
      "allowed": false
    }
  ]
}
```

### Custom Messages

Provide helpful error messages:

```json
{
  "rules": [
    {
      "id": "my-rule",
      "message": "Domain entities cannot depend on infrastructure. Create a port interface instead.",
      "examples": {
        "bad": [
          "import { Database } from '../../infrastructure/db'"
        ],
        "good": [
          "import { UserRepository } from '../ports/user-repository'"
        ]
      }
    }
  ]
}
```

### Severity Levels

Control whether violations are errors or warnings:

```json
{
  "rules": [
    { "id": "strict-rule", "severity": "error" },
    { "id": "soft-rule", "severity": "warn" }
  ]
}
```

## Troubleshooting

### "Could not load .stricture/config.json"

Make sure the configuration file exists:

```bash
npx stricture init
```

### "File does not match any boundary"

Check your boundary patterns. You may need to add a catch-all boundary:

```json
{
  "boundaries": [
    { "name": "other", "pattern": "src/**", "mode": "file" }
  ]
}
```

### "Pattern syntax error"

Verify your glob patterns are valid. Common issues:

- Use `**` for recursive matching, not `*`
- Use forward slashes `/` even on Windows
- Escape special characters if needed

## Performance

The plugin is optimized for performance:

- Configuration loaded once per ESLint run
- Glob patterns compiled and cached
- Early exit on non-matching files
- Minimal overhead per import check

Typical overhead: < 5% of total lint time

## Integration

Works with:

- ✅ ESLint 8.x and 9.x
- ✅ TypeScript via `@typescript-eslint`
- ✅ JavaScript (CommonJS and ESM)
- ✅ JSX/TSX files
- ✅ Monorepos (via `baseUrl` option)
- ✅ VSCode ESLint extension (real-time feedback)
- ✅ CI/CD pipelines

## API Reference

For complete API documentation, visit [stricture.dev/docs/api/eslint-plugin](https://stricture.dev/docs/api/eslint-plugin)

## License

MIT
