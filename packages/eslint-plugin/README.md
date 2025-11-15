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
  5:1  error  Domain cannot import from adapters

       Rule: Domain Isolation (domain-isolation)
       From: domain
       To:   adapters

       Domain layer must remain pure - no external dependencies.

       Suggestion: Create a port interface in src/core/ports/ instead.

       Allowed:
         ✓ import { IUserRepo } from '../ports/user-repo'

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

## Controlling External Dependencies

By default, external dependencies (node_modules) are allowed. You can control them using the special `external` tag:

### Block All Externals in Domain

```json
{
  "boundaries": [
    { "name": "domain", "pattern": "src/domain/**" }
  ],
  "rules": [
    {
      "id": "domain-pure",
      "from": { "tag": "domain" },
      "to": { "tag": "external" },
      "allowed": false,
      "message": "Domain must not import external libraries"
    }
  ]
}
```

```typescript
// src/domain/user.ts
import { z } from 'zod'  // ❌ Error: Domain must not import external libraries
```

### Allow Specific Externals

```json
{
  "rules": [
    {
      "id": "domain-no-externals",
      "from": { "tag": "domain" },
      "to": { "tag": "external" },
      "allowed": false
    },
    {
      "id": "domain-allow-types",
      "from": { "tag": "domain" },
      "to": { "pattern": "node_modules/@types/**" },
      "allowed": true,
      "message": "Type definitions are allowed"
    }
  ]
}
```

## Wildcard Matching

Use the wildcard tag `*` to match any boundary:

```json
{
  "rules": [
    {
      "id": "domain-isolated",
      "from": { "tag": "domain" },
      "to": { "tag": "*" },
      "allowed": false,
      "message": "Domain cannot import from ANY other boundary"
    }
  ]
}
```

This blocks domain from importing anything (including external dependencies).

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

Control whether violations are errors, warnings, or disabled:

```json
{
  "rules": [
    { "id": "strict-rule", "severity": "error" },  // Reports as error
    { "id": "soft-rule", "severity": "warn" },     // Reports as [WARNING]
    { "id": "disabled-rule", "severity": "off" }   // Not reported
  ]
}
```

**Severity Behavior:**
- `"error"` - Violation reported normally
- `"warn"` - Violation reported with `[WARNING]` prefix
- `"off"` - Violation not reported (rule is skipped)

**Disabling Preset Rules:**

Use `overrides` to disable specific rules from presets:

```json
{
  "preset": "@stricture/hexagonal",
  "overrides": [
    {
      "id": "driving-independent",
      "severity": "off"
    }
  ]
}
```

This is useful when a preset rule conflicts with your framework's requirements (e.g., Next.js app structure).

### Path Alias Resolution

The plugin automatically resolves TypeScript path aliases from `tsconfig.json`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/core/*"],
      "@adapters/*": ["src/adapters/*"]
    }
  }
}
```

```typescript
// This import is resolved correctly:
import { User } from '@core/domain/user'  // Resolves to src/core/domain/user
// Then validated against boundaries
```

**No additional configuration needed** - works automatically if tsconfig.json exists.

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
