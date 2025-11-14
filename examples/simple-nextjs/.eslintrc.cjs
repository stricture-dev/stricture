module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['@stricture'],
  rules: {
    '@stricture/enforce-boundaries': 'error'
  },
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
