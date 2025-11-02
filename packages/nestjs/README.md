# @stricture/nestjs

NestJS-specific architecture preset for Stricture with module encapsulation and DI boundaries.

## Features

- **Module Encapsulation** - Enforce module boundaries
- **DI Container Boundaries** - Services injected properly
- **Controller Isolation** - Controllers only in controller files
- **DTOs Separated from Entities** - Keep concerns separated
- **Composable** - Works with hexagonal or layered presets

## Installation

```bash
npm install -D @stricture/nestjs @stricture/eslint-plugin
npx stricture init --preset @stricture/nestjs
```

## Directory Structure

```
src/
├── modules/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   └── entities/
│   └── auth/
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── ...
└── common/
    ├── guards/
    ├── interceptors/
    └── filters/
```

## Rules

- Controllers only in *.controller.ts files
- Services injected via DI
- Modules self-contained
- DTOs separated from entities

## License

MIT
