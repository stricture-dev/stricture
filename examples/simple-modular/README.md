# Simple Modular Architecture Example

Minimal example demonstrating **Modular Architecture** with Stricture boundary enforcement.

## What This Example Shows

- **Feature modules** organized as vertical slices (`user`, `tasks`)
- **Public APIs** via `index.ts` files
- **Shared utilities** accessible to all modules
- **Strong encapsulation** - internal files are private

## Structure

```
src/
├── features/
│   ├── user/
│   │   ├── index.ts           # ✅ Public API
│   │   ├── types.ts           # ❌ Private
│   │   └── user-service.ts    # ❌ Private
│   └── tasks/
│       ├── index.ts           # ✅ Public API
│       ├── types.ts           # ❌ Private
│       └── task-service.ts    # ❌ Private
└── shared/
    ├── types/
    │   └── common.ts          # ✅ Shared
    └── utils/
        └── format.ts          # ✅ Shared
```

## Architecture Rules

### ✅ Allowed

- Modules import from other modules' **public APIs** (`../user` not `../user/types`)
- All modules can import from `shared/`
- Internal files can import within the same module

### ❌ Not Allowed

- Importing internal files from other modules
- Shared utilities importing from feature modules

## Running

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run the example
pnpm --filter @stricture-examples/simple-modular dev

# Check boundaries with ESLint
pnpm --filter @stricture-examples/simple-modular lint

# Type check
pnpm --filter @stricture-examples/simple-modular type-check
```

## Key Principles

1. **Public API** - Each module has one `index.ts` that defines what others can import
2. **Encapsulation** - Internal implementation is private
3. **Independence** - Modules don't depend on each other's internals
4. **Shared Code** - Common utilities go in `shared/`

## Stricture Configuration

The `.stricture/config.json` file uses the modular preset:

```json
{
  "preset": "@stricture/modular"
}
```

That's it! The preset handles all boundary enforcement automatically.
