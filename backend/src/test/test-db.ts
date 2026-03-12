import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
export const testDatabasePath = path.resolve(testDir, '../../prisma/test.db');
export const testDatabaseUrl = `file:${testDatabasePath}`;
