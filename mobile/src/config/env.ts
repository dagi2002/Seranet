import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().trim().url().transform((value) => value.replace(/\/+$/, '')),
  EXPO_PUBLIC_DEFAULT_STORE_SLUG: z
    .string()
    .trim()
    .min(2, 'EXPO_PUBLIC_DEFAULT_STORE_SLUG is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Store slug must be lowercase and hyphenated'),
});

const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_DEFAULT_STORE_SLUG: process.env.EXPO_PUBLIC_DEFAULT_STORE_SLUG,
});

export const env = parsedEnv.success ? parsedEnv.data : null;

export function getEnvError() {
  if (parsedEnv.success) return null;
  return parsedEnv.error.issues.map((issue) => issue.message).join('\n');
}
