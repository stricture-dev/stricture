# Stricture

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
# Install for Next.js with Hexagonal architecture
npm install -D @stricture/nextjs @stricture/hexagonal

# Initialize configuration
npx stricture init

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

| Preset | Description | Best For |
|--------|-------------|----------|
| **@stricture/hexagonal** | Ports & Adapters architecture | Domain-driven applications |
| **@stricture/clean** | Uncle Bob's Clean Architecture | Enterprise applications |
| **@stricture/layered** | Traditional 3-tier architecture | Standard web applications |
| **@stricture/modular** | Feature-based modules | Large monolithic apps |

## Framework Integration

| Framework | Package | Features |
|-----------|---------|----------|
| **Next.js** | @stricture/nextjs | Server/Client component boundaries, App Router support |
| **NestJS** | @stricture/nestjs | Module encapsulation, DI boundaries |

## Packages

This is a monorepo containing:

### Core Packages

- **[@stricture/core](./packages/core)** - Core types and utilities
- **[@stricture/eslint-plugin](./packages/eslint-plugin)** - ESLint plugin for boundary enforcement
- **[@stricture/cli](./packages/cli)** - Interactive CLI tool

### Architecture Presets

- **[@stricture/hexagonal](./packages/hexagonal)** - Hexagonal/Ports & Adapters
- **[@stricture/clean](./packages/clean)** - Clean Architecture
- **[@stricture/layered](./packages/layered)** - Layered Architecture
- **[@stricture/modular](./packages/modular)** - Modular Architecture

### Framework Integrations

- **[@stricture/nextjs](./packages/nextjs)** - Next.js preset
- **[@stricture/nestjs](./packages/nestjs)** - NestJS preset

### Apps

- **[docs](./apps/docs)** - Documentation website (stricture.dev)

### Examples

- **[nextjs-hexagonal](./examples/nextjs-hexagonal)** - E-commerce app with hexagonal architecture
- **[nestjs-layered](./examples/nestjs-layered)** - API with layered architecture
- **[react-modular](./examples/react-modular)** - Dashboard with feature modules

## How It Works

1. **Choose a preset** - Select an architecture that fits your needs
2. **Configure boundaries** - Define layers, modules, or domains in `.stricture/config.json`
3. **Write code** - Stricture's ESLint plugin validates imports in real-time
4. **Get feedback** - Clear error messages show what's wrong and how to fix it

## Configuration Example

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
      "name": "ports",
      "pattern": "src/core/ports/**",
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
      "from": "domain",
      "to": "*",
      "allowed": false,
      "message": "Domain layer must remain pure - no external dependencies"
    },
    {
      "from": "adapters",
      "to": "domain",
      "allowed": false,
      "message": "Adapters should depend on ports, not domain directly"
    }
  ]
}
```

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
