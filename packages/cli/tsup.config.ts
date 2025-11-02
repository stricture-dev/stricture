import { defineConfig } from 'tsup'

export default defineConfig([
  // Main library
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true
  },
  // CLI binary
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    clean: false,
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
])
