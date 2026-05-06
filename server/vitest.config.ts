import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals like describe, it, expect
    globals: true,
    // Provide a mocked environment
    environment: 'node',
    // Restore mocks before every test to avoid leakages
    restoreMocks: true,
    // Exclude archive and dist
    exclude: ['**/node_modules/**', '**/dist/**', '**/archive/**'],
  },
});
