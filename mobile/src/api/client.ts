import { env } from '../config/env';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!env) {
    throw new Error('Mobile environment is not configured');
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && typeof options.body !== 'undefined') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${env.EXPO_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      typeof options.body === 'undefined'
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      // Ignore non-JSON responses.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
