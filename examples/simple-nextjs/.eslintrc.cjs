module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  plugins: ['@stricture'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Stricture boundary enforcement - this is the key rule!
    '@stricture/enforce-boundaries': 'error'
  }
}
