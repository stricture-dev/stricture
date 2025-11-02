# React Modular Architecture Example

Example React dashboard using feature-based Modular Architecture, enforced by Stricture.

## Architecture

Each feature is a self-contained module with:
- Public API (index.ts)
- Internal components, hooks, utils (private)
- No direct cross-module imports (only via public API)

## Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts          # Public: LoginForm, useAuth
│   │   ├── components/       # Private
│   │   ├── hooks/            # Private
│   │   └── api/              # Private
│   ├── dashboard/
│   │   ├── index.ts          # Public: Dashboard, Widget
│   │   └── ...
│   ├── users/
│   │   ├── index.ts
│   │   └── ...
│   └── settings/
│       ├── index.ts
│       └── ...
└── shared/                   # Shared UI components
    ├── components/
    └── utils/
```

## Running

```bash
pnpm install
pnpm dev
```

## Key Learnings

- Modules are loosely coupled
- Easy to add/remove features
- Teams can work in parallel
- Clear public API per module
- Shared utilities accessible to all

## License

MIT
