# @stricture/typescript-config

Shared TypeScript configurations for Stricture monorepo packages.

## Configs

- **base.json** - Base config for Node.js/library packages
- **nextjs.json** - Next.js specific config
- **react.json** - React specific config

## Usage

In a package's `tsconfig.json`:

```json
{
  "extends": "@stricture/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

For Next.js:

```json
{
  "extends": "@stricture/typescript-config/nextjs.json"
}
```

For React:

```json
{
  "extends": "@stricture/typescript-config/react.json"
}
```

## Features

- **Strict mode** enabled
- **Modern ES targets** (ES2020)
- **Module resolution** optimized for bundlers
- **Source maps** and **declarations** enabled
- **Unused variables** checking
- **Consistent casing** enforcement
