# Stricture

[![CI](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml/badge.svg)](https://github.com/stricture-dev/stricture/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Software architecture boundary enforcement for TypeScript projects

Stricture helps you maintain clean architecture by automatically enforcing import rules through ESLint. Choose from predefined architecture presets (Hexagonal, Layered, Modular, Clean) and get instant feedback when code violates architectural boundaries.

## Why Stricture?

- **Prevent architecture drift** - Catch violations during development, not in code review
- **Clear boundaries** - Enforce separation between layers, modules, and concerns
- **Multiple architectures** - Support for Hexagonal, Clean, Layered, and Modular architectures
- **Framework integration** - Special presets for Next.js, NestJS, and more
- **Developer-friendly** - Clear error messages with examples and suggestions
- **Zero runtime overhead** - All checks happen at lint time

## Quick Start

```bash
# Install the ESLint plugin (includes all presets)
npm install -D @stricture/eslint-plugin

# Add to your ESLint config
# eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [
  stricture.configs.hexagonal()  // Choose your architecture
]

# Your ESLint will now enforce architectural boundaries!
```

## Example

```typescript
// ❌ This will fail linting
// adapters/api.ts
import { User } from '../core/domain/user'  // Adapters can't import domain directly!

// ✅ This is correct
// adapters/api.ts
import { UserPort } from '../core/ports/user-port'  // Adapters depend on ports
```

## Architecture Presets

All presets are bundled with `@stricture/eslint-plugin`:

| Config | Description | Best For |
|--------|-------------|----------|
| `stricture.configs.hexagonal()` | Ports & Adapters architecture | Domain-driven applications |
| `stricture.configs.clean()` | Uncle Bob's Clean Architecture | Enterprise applications |
| `stricture.configs.layered()` | Traditional 3-tier architecture | Standard web applications |
| `stricture.configs.modular()` | Feature-based modules | Large monolithic apps |

## Framework Integration

Framework-specific presets included:

| Framework | Config | Features |
|-----------|--------|----------|
| **Next.js** | `stricture.configs.nextjs()` | Server/Client component boundaries, App Router support |
| **NestJS** | `stricture.configs.nestjs()` | Module encapsulation, DI boundaries |

## Packages

This is a monorepo containing:

### Published Packages (For Users)

- **[@stricture/eslint-plugin](./packages/eslint-plugin)** - ESLint plugin with all bundled presets
- **[@stricture/core](./packages/core)** - Core types and utilities (auto-installed)
- **[@stricture/cli](./packages/cli)** - Interactive CLI tool (optional)

### Preset Packages (Bundled in eslint-plugin)

All architecture presets are included in `@stricture/eslint-plugin`:
- **[@stricture/hexagonal](./packages/hexagonal)** - Hexagonal/Ports & Adapters
- **[@stricture/clean](./packages/clean)** - Clean Architecture
- **[@stricture/layered](./packages/layered)** - Layered Architecture
- **[@stricture/modular](./packages/modular)** - Modular Architecture
- **[@stricture/nextjs](./packages/nextjs)** - Next.js preset
- **[@stricture/nestjs](./packages/nestjs)** - NestJS preset

> **Note:** Preset packages can also be installed separately for advanced use cases with file-based configuration.

### Apps & Examples

- **[docs](./apps/docs)** - Documentation website (stricture.dev)
- **[nextjs-hexagonal](./examples/nextjs-hexagonal)** - E-commerce app with hexagonal architecture
- **[nestjs-layered](./examples/nestjs-layered)** - API with layered architecture
- **[react-modular](./examples/react-modular)** - Dashboard with feature modules

## How It Works

1. **Install** - Add `@stricture/eslint-plugin` to your project
2. **Choose a preset** - Use a bundled config like `stricture.configs.hexagonal()`
3. **Write code** - Stricture's ESLint plugin validates imports in real-time
4. **Get feedback** - Clear error messages show what's wrong and how to fix it

## Controlling External Dependencies

Stricture can enforce rules about external npm packages:

```typescript
// Block domain from using any external libraries
{
  "rules": [
    {
      "id": "domain-pure",
      "from": { "tag": "domain" },
      "to": { "tag": "external" },  // Special tag for node_modules
      "allowed": false
    }
  ]
}
```

See the [External Dependencies guide](https://stricture.dev/docs/external-dependencies) for details.

## Configuration Example

### Inline Config (Recommended)

```js
// eslint.config.js
import stricture from '@stricture/eslint-plugin'

export default [
  // Use a preset
  stricture.configs.hexagonal(),

  // Or customize inline
  stricture.configs.hexagonal({
    rules: [
      {
        id: 'no-legacy-imports',
        from: { pattern: 'src/**' },
        to: { pattern: 'src/legacy/**' },
        allowed: false,
        message: 'No new code should depend on legacy modules'
      }
    ]
  })
]
```

### File-Based Config (Alternative)

For complex configurations, use `.stricture/config.json`:

```json
{
  "preset": "@stricture/hexagonal",
  "boundaries": [
    {
      "name": "shared",
      "pattern": "src/shared/**",
      "mode": "file",
      "tags": ["shared"]
    }
  ],
  "rules": [
    {
      "id": "allow-shared",
      "from": { "tag": "*" },
      "to": { "tag": "shared" },
      "allowed": true
    }
  ]
}
```

Then use `stricture.configs.recommended()` to load the file.

## Documentation

- [Getting Started Guide](https://stricture.dev/docs/getting-started)
- [Architecture Presets](https://stricture.dev/docs/presets)
- [Configuration Reference](https://stricture.dev/docs/configuration)
- [API Documentation](https://stricture.dev/docs/api)
- [Examples & Recipes](https://stricture.dev/docs/examples)

## Development

This project uses:

- **pnpm** - Package manager
- **Turborepo** - Build system
- **TypeScript** - Language
- **Vitest** - Testing
- **tsup** - Library bundling

```bash
# Install dependencies
pnpm install

# Run all packages in dev mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Stricture](./LICENSE)

## Credits

Inspired by:
- [Nx Module Boundaries](https://nx.dev/core-features/enforce-module-boundaries)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- Clean Architecture by Robert C. Martin
- Hexagonal Architecture by Alistair Cockburn
