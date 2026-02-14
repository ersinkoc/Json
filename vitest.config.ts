import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        'mcp-server/',
        '*.config.*',
        'dist/',
        'src/cli/',
        'src/types.ts',
        'src/plugins/optional/stream.plugin.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
