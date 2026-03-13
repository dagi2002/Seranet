import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function normalizeNodeEnv(value: string | undefined) {
  if (value === 'production' || value === 'test') {
    return value;
  }

  return 'development';
}

const normalizeOrigins = (value: string | undefined) =>
  value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

function parsePort(value: string | undefined) {
  const parsed = Number(value || 4000);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return parsed;
}

function trimEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePublicBaseUrl(value: string | undefined) {
  const trimmed = trimEnv(value);
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
}

const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);
const databaseUrl = trimEnv(process.env.DATABASE_URL);
const jwtSecret = trimEnv(process.env.JWT_SECRET) || (nodeEnv === 'production' ? undefined : 'seranet-local-dev-secret');
const corsOrigins = normalizeOrigins(process.env.CORS_ORIGIN);

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required in production');
}

export const env = {
  nodeEnv,
  databaseUrl,
  port: parsePort(process.env.PORT),
  jwtSecret,
  corsOrigins: corsOrigins.length > 0 ? corsOrigins : nodeEnv === 'production' ? [] : ['http://localhost:5173'],
  uploadsDir: path.resolve(process.cwd(), process.env.UPLOADS_DIR || 'uploads'),
  uploadsBaseUrl: normalizePublicBaseUrl(process.env.UPLOADS_BASE_URL),
};
