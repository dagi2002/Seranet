import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const testDatabaseUrl = `file:${path.resolve(backendDir, 'prisma/test.db')}`;

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: 'test-secret',
    },
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
  },
});
