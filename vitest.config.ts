import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'server/vitest.config.ts',
      'web/vite.config.ts',
    ],
  },
});
