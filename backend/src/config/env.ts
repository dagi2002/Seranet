import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const normalizeOrigins = (value: string | undefined) =>
  value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) ?? ['http://localhost:5173'];

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'seranet-secret',
  corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN),
  uploadsDir: path.join(process.cwd(), 'uploads'),
};
