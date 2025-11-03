module.exports = {
  extends: ['@stricture/eslint-config/base'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
