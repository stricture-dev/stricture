# @stricture/eslint-plugin

ESLint plugin that enforces software architecture boundaries by controlling import statements based on your chosen architectural pattern.

## Installation

```bash
npm install -D @stricture/eslint-plugin
```

All official architecture presets are bundled with the plugin - no need to install them separately!

## Quick Start

### Zero-Config Setup

The simplest way to use Stricture:

```javascript
// eslint.config.js (Flat config - recommended)
import stricture from '@stricture/eslint-plugin'

export default [
  stricture.configs.hexagonal()  // That's it!
]
```

**No `.stricture/config.json` needed!** The preset is loaded automatically from `node_modules`.

### With Customization

Add overrides to the preset:

```javascript
// eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [
  stricture.configs.hexagonal({
    ignorePatterns: ['**/*.test.ts', 'src/legacy/**'],
    rules: [
      {
        id: 'no-legacy-imports',
        from: { pattern: 'src/**', exclude: ['src/legacy/**'] },
        to: { pattern: 'src/legacy/**' },
        allowed: false,
        message: 'No new code should depend on legacy modules'
      }
    ]
  })
]
```

### Using a Separate Config File

For complex configurations (10+ custom rules):

```javascript
// eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [
  stricture.configs.recommended()  // Reads .stricture/config.json
]
```

```json
// .stricture/config.json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [ /* many boundaries */ ],
  "rules": [ /* many rules */ ]
}
```

---

## Available Preset Configs

All preset configs are factory functions that support inline customization:

- `stricture.configs.recommended()` - Basic setup (reads `.stricture/config.json`)
- `stricture.configs.hexagonal()` - Hexagonal Architecture (Ports & Adapters)
- `stricture.configs.layered()` - Layered Architecture (N-tier)
- `stricture.configs.clean()` - Clean Architecture
- `stricture.configs.modular()` - Modular Architecture
- `stricture.configs.nextjs()` - Next.js App Router patterns
- `stricture.configs.nestjs()` - NestJS framework patterns

---

## Advanced Usage

### Using with `defineConfig()` and `extends`

If you're using ESLint 9.17+ or `@eslint/config-helpers`:

```javascript
// eslint.config.js
import { defineConfig } from 'eslint/config'
import stricture from '@stricture/eslint-plugin'

export default defineConfig([
  {
    files: ['src/**/*.ts'],
    extends: [stricture.configs.hexagonal()]
  },
  {
    files: ['tests/**/*.ts'],
    extends: [stricture.configs.hexagonal({
      rules: [/* test-specific overrides */]
    })]
  }
])
```

This pattern is useful for applying different configurations to different file sets.

### Per-File Configurations

Apply different presets to different parts of your codebase:

```javascript
import { defineConfig } from 'eslint/config'
import stricture from '@stricture/eslint-plugin'

export default defineConfig([
  {
    files: ['src/api/**/*.ts'],
    extends: [stricture.configs.hexagonal()]
  },
  {
    files: ['src/web/**/*.tsx'],
    extends: [stricture.configs.nextjs()]
  }
])
```

---

## Legacy ESLint Config

If you're still using `.eslintrc.js` format:

```javascript
// .eslintrc.js
const stricture = require('@stricture/eslint-plugin')

module.exports = {
  extends: ['plugin:@stricture/recommended'],
  rules: {
    '@stricture/enforce-boundaries': ['error', {
      inlineConfig: stricture.hexagonalPreset
    }]
  }
}
```

We recommend migrating to flat config for better TypeScript support and simpler inline configuration.

---

## Rule: `@stricture/enforce-boundaries`

Enforces architectural boundary rules defined in your configuration.

### When it triggers

- When an import statement violates a boundary rule
- When a file in one boundary tries to import from a forbidden boundary

### Error example

```typescript
// src/core/domain/user.ts
import { api } from '../../adapters/api'  // ❌ Error!
// @stricture/enforce-boundaries: Domain layer cannot import from adapters
// Domain must remain pure - no external dependencies
```

### Options

```typescript
{
  rules: {
    '@stricture/enforce-boundaries': ['error', {
      // Inline configuration (takes priority over config file)
      inlineConfig?: StrictureConfig,

      // Path to config file (default: '.stricture/config.json')
      configPath?: string,

      // Base URL for path resolution (default: './')
      baseUrl?: string,

      // Check dynamic imports (default: true)
      checkDynamicImports?: boolean
    }]
  }
}
```

Example with custom config path:

```javascript
import stricture from '@stricture/eslint-plugin'

export default [
  {
    plugins: { '@stricture': stricture },
    rules: {
      '@stricture/enforce-boundaries': ['error', {
        configPath: './architecture/boundaries.json',
        baseUrl: './src'
      }]
    }
  }
]
```

---

## Configuration Priority

When multiple configuration methods are present, Stricture uses this priority:

1. **Inline config** (highest priority) - `stricture.configs.hexagonal({ ... })`
2. **File config** - `.stricture/config.json`
3. **No config found** → Error with helpful message

---

## TypeScript Support

### Type Safety with `defineConfig()`

Get full TypeScript IntelliSense in your ESLint config:

```typescript
// eslint.config.ts
import { defineConfig } from 'eslint/config'
import stricture from '@stricture/eslint-plugin'

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [stricture.configs.hexagonal()]
  }
])
```

### Path Aliases

Stricture automatically resolves TypeScript path aliases using your `tsconfig.json`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/domain/*": ["src/domain/*"],
      "@/infrastructure/*": ["src/infrastructure/*"]
    }
  }
}
```

No additional configuration needed.

---

## Examples

### Basic Hexagonal Architecture

```javascript
// eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [stricture.configs.hexagonal()]
```

### With Custom Rules

```javascript
// eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [
  stricture.configs.hexagonal({
    ignorePatterns: ['**/*.test.ts'],
    rules: [
      {
        id: 'shared-utilities',
        name: 'Allow Shared Utilities',
        from: { pattern: '**' },
        to: { pattern: 'src/shared/utils/**' },
        allowed: true
      }
    ]
  })
]
```

### Monorepo Setup

Different presets for different packages:

```javascript
// packages/api/eslint.config.js
import stricture from '@stricture/eslint-plugin'
export default [stricture.configs.hexagonal()]
```

```javascript
// packages/web/eslint.config.js
import stricture from '@stricture/eslint-plugin'
export default [stricture.configs.nextjs()]
```

### Next.js with Hexagonal Architecture

```javascript
// eslint.config.js
import { defineConfig } from 'eslint/config'
import stricture from '@stricture/eslint-plugin'

export default defineConfig([
  // Next.js App Router patterns
  {
    files: ['app/**/*.tsx', 'app/**/*.ts'],
    extends: [stricture.configs.nextjs()]
  },
  // Business logic with hexagonal architecture
  {
    files: ['src/**/*.ts'],
    extends: [stricture.configs.hexagonal()]
  }
])
```

---

## Documentation

- **[Installation Guide](https://stricture.dev/getting-started/installation/)** - Get started quickly
- **[ESLint Configuration Guide](https://stricture.dev/guides/eslint-setup/)** - All ESLint config options
- **[Configuration Files](https://stricture.dev/configuration/config-file/)** - Deep dive into `.stricture/config.json`
- **[Presets](https://stricture.dev/presets/)** - Explore available architecture presets
- **[API Reference](https://stricture.dev/api/eslint-plugin/)** - Complete API documentation

---

## Troubleshooting

### Config not loading

**Problem**: Stricture doesn't seem to read my configuration.

**Check**:
1. Are you calling the config function? `stricture.configs.hexagonal()` not `stricture.configs.hexagonal`
2. Run with debug flag: `npx eslint --debug .`

### TypeScript paths not resolving

**Problem**: Stricture doesn't recognize TypeScript path aliases.

**Solution**:
1. Ensure `tsconfig.json` is in your project root
2. Verify `baseUrl` and `paths` are configured
3. Restart your IDE/ESLint server

For more help, see the [Troubleshooting Guide](https://stricture.dev/guides/troubleshooting/).

---

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.

## Related Packages

- [`@stricture/core`](../core/README.md) - Core validation engine (automatically installed)
- [`@stricture/cli`](../cli/README.md) - Command-line interface for Stricture

### Bundled Presets

All official architecture presets are bundled with this plugin:

- [`@stricture/hexagonal`](../hexagonal/README.md) - Hexagonal architecture (Ports & Adapters)
- [`@stricture/layered`](../layered/README.md) - Layered architecture (N-tier)
- [`@stricture/clean`](../clean/README.md) - Clean architecture
- [`@stricture/modular`](../modular/README.md) - Modular architecture
- [`@stricture/nextjs`](../nextjs/README.md) - Next.js App Router patterns
- [`@stricture/nestjs`](../nestjs/README.md) - NestJS framework patterns
