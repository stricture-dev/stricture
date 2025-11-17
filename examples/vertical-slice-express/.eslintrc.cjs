module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', '@stricture'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // Stricture boundary enforcement - enforces feature isolation
    '@stricture/enforce-boundaries': 'error',
    // Allow `any` type for this example (in production, you'd want to be stricter)
    '@typescript-eslint/no-explicit-any': 'off'
  }
}
