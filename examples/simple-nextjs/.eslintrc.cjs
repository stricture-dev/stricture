module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@stricture/recommended'],
  plugins: ['@stricture'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
