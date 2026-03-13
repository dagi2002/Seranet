import type { Request } from 'express';
import { ValidationError } from './errors';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorPattern = /^#[0-9a-fA-F]{6}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireObject(value: unknown, name: string) {
  if (!isPlainObject(value)) {
    throw new ValidationError(`${name} must be an object`);
  }

  return value;
}

export function requireTrimmedString(
  value: unknown,
  name: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {},
) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} is required`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${name} is required`);
  }

  if (options.minLength && normalized.length < options.minLength) {
    throw new ValidationError(`${name} must be at least ${options.minLength} characters`);
  }

  if (options.maxLength && normalized.length > options.maxLength) {
    throw new ValidationError(`${name} must be ${options.maxLength} characters or fewer`);
  }

  if (options.pattern && !options.pattern.test(normalized)) {
    throw new ValidationError(options.patternMessage ?? `${name} is invalid`);
  }

  return normalized;
}

export function optionalTrimmedString(
  value: unknown,
  name: string,
  options: {
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {},
) {
  if (typeof value === 'undefined' || value === null || value === '') {
    return undefined;
  }

  return requireTrimmedString(value, name, { minLength: 1, ...options });
}

export function requireEmail(value: unknown, name: string) {
  const email = requireTrimmedString(value, name, { maxLength: 254 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError(`${name} must be a valid email address`);
  }

  return email.toLowerCase();
}

export function optionalPhone(value: unknown, name: string) {
  const phone = optionalTrimmedString(value, name, { maxLength: 32 });
  if (!phone) return undefined;

  if (!/^[0-9+\-\s()]{7,32}$/.test(phone)) {
    throw new ValidationError(`${name} is invalid`);
  }

  return phone;
}

export function requirePhone(value: unknown, name: string) {
  const phone = requireTrimmedString(value, name, { minLength: 7, maxLength: 32 });
  if (!/^[0-9+\-\s()]{7,32}$/.test(phone)) {
    throw new ValidationError(`${name} is invalid`);
  }

  return phone;
}

export function requireSlug(value: unknown, name: string) {
  return requireTrimmedString(value, name, {
    minLength: 2,
    maxLength: 80,
    pattern: slugPattern,
    patternMessage: `${name} must contain lowercase letters, numbers, and hyphens only`,
  });
}

export function requireIdParam(req: Request, key: string, label: string) {
  return requireTrimmedString(req.params[key], label, { minLength: 3, maxLength: 191 });
}

export function requireSlugParam(req: Request) {
  return requireSlug(req.params.slug, 'Store slug');
}

export function requireAccessToken(req: Request) {
  return requireTrimmedString(req.query.access_token, 'Access token', { minLength: 16, maxLength: 255 });
}

export function requireUrl(value: unknown, name: string) {
  const normalized = requireTrimmedString(value, name, { minLength: 1, maxLength: 2048 });
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:')
  ) {
    return normalized;
  }

  throw new ValidationError(`${name} must be a valid URL`);
}

export function optionalUrl(value: unknown, name: string) {
  if (typeof value === 'undefined' || value === null || value === '') {
    return undefined;
  }

  return requireUrl(value, name);
}

export function optionalUrlArray(
  value: unknown,
  name: string,
  options: { minLength?: number; maxLength?: number } = {},
) {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array`);
  }

  const normalized = value.map((entry, index) => requireUrl(entry, `${name} #${index + 1}`));

  if (typeof options.minLength === 'number' && normalized.length < options.minLength) {
    throw new ValidationError(`${name} must include at least ${options.minLength} image${options.minLength === 1 ? '' : 's'}`);
  }

  if (typeof options.maxLength === 'number' && normalized.length > options.maxLength) {
    throw new ValidationError(`${name} cannot include more than ${options.maxLength} images`);
  }

  if (new Set(normalized).size !== normalized.length) {
    throw new ValidationError(`${name} cannot contain duplicate images`);
  }

  return normalized;
}

export function optionalBoolean(value: unknown, name: string) {
  if (typeof value === 'undefined') return undefined;
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be true or false`);
  }

  return value;
}

export function optionalInteger(
  value: unknown,
  name: string,
  options: { min?: number; max?: number } = {},
) {
  if (typeof value === 'undefined') return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ValidationError(`${name} must be a whole number`);
  }

  if (typeof options.min === 'number' && value < options.min) {
    throw new ValidationError(`${name} must be at least ${options.min}`);
  }

  if (typeof options.max === 'number' && value > options.max) {
    throw new ValidationError(`${name} must be at most ${options.max}`);
  }

  return value;
}

export function requireInteger(
  value: unknown,
  name: string,
  options: { min?: number; max?: number } = {},
) {
  const parsed = optionalInteger(value, name, options);
  if (typeof parsed === 'undefined') {
    throw new ValidationError(`${name} is required`);
  }

  return parsed;
}

export function optionalEnum<T extends string>(
  value: unknown,
  name: string,
  allowedValues: readonly T[],
) {
  if (typeof value === 'undefined') return undefined;
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new ValidationError(`${name} is invalid`);
  }

  return value as T;
}

export function requireEnum<T extends string>(
  value: unknown,
  name: string,
  allowedValues: readonly T[],
) {
  const parsed = optionalEnum(value, name, allowedValues);
  if (!parsed) {
    throw new ValidationError(`${name} is required`);
  }

  return parsed;
}

export function optionalHexColor(value: unknown, name: string) {
  const color = optionalTrimmedString(value, name, { maxLength: 7 });
  if (!color) return undefined;
  if (!hexColorPattern.test(color)) {
    throw new ValidationError(`${name} must be a valid hex color`);
  }

  return color;
}

export function requireArray(value: unknown, name: string) {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array`);
  }

  return value;
}
