import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'node',
    pool: 'forks',
    environmentOptions: {
      jsdom: { pretendToBeVisual: true },
    },
    coverage: {
      provider: 'v8',
      // The unit-tested behavior surface. The wiring layer
      // (src/client/index.ts) and the host halves are exercised by the
      // built-bundle smoke test through lib/, which v8 instrumentation
      // cannot reach — instrumenting them would only drag the report down
      // without adding a runnable gate.
      include: ['src/client/**/*.ts'],
      exclude: ['src/client/index.ts'],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
})
