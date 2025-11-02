# @stricture/eslint-config

Shared ESLint configurations for Stricture monorepo packages.

## Configs

- **base.js** - Base config for Node.js/library packages
- **nextjs.js** - Next.js specific config
- **react.js** - React specific config

## Usage

In a package's `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@stricture/eslint-config/base.js']
}
```

For Next.js:

```javascript
module.exports = {
  extends: ['@stricture/eslint-config/nextjs.js']
}
```

For React:

```javascript
module.exports = {
  extends: ['@stricture/eslint-config/react.js']
}
```

## Features

- **TypeScript support** via @typescript-eslint
- **Unused variable detection**
- **Consistent code style**
- **React/Next.js optimized rules**
