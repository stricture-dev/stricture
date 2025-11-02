# @stricture/modular

Feature-based modular architecture preset for Stricture. Enforces encapsulation of feature modules with explicit public APIs.

## What is Modular Architecture?

Modular architecture organizes code by features/modules where:

- **Each module is self-contained**
- **Modules expose public APIs** (via index.ts)
- **Internal files are private**
- **Cross-module imports only through public APIs**

## Installation

```bash
npm install -D @stricture/modular @stricture/eslint-plugin
npx stricture init --preset @stricture/modular
```

## Directory Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── index.ts          # Public API
│   │   ├── components/       # Private
│   │   ├── hooks/            # Private
│   │   └── utils/            # Private
│   ├── dashboard/
│   │   ├── index.ts          # Public API
│   │   └── ...
│   └── profile/
│       ├── index.ts
│       └── ...
└── shared/                   # Shared utilities
    ├── components/
    └── utils/
```

## Rules

### 1. Import from Public API Only

```typescript
// ❌ BAD - Importing internal file
import { LoginForm } from '../auth/components/login-form'

// ✅ GOOD - Importing from public API
import { LoginForm } from '../auth'
```

### 2. Shared Code is Allowed

```typescript
// ✅ GOOD - Shared utilities can be imported anywhere
import { Button } from '../../shared/components/button'
```

## Benefits

✅ **Scalable** - Add features without affecting others
✅ **Clear boundaries** - Module internals are private
✅ **Parallel development** - Teams work on separate modules
✅ **Easy to refactor** - Move modules or extract to packages

## License

MIT
