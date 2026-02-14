import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/plugins/index.ts'],
    outDir: 'dist/plugins',
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/cli/index.ts'],
    outDir: 'dist/cli',
    format: ['esm'],
    banner: { js: '#!/bin/env node' + '\n' },
    sourcemap: true,
    treeshake: true,
    minify: false,
    dts: true,
  },
]);
