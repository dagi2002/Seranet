export const STORAGE_KEYS = {
  db: 'seranet_mock_db_v1',
  user: 'seranet_current_user',
  authToken: 'seranet_auth_token',
  onboarding: 'seranet_onboarding_v2',
};

export const cartStorageKey = (slug: string) => `cart_${slug}`;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function readTextStorage(key: string) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export function writeTextStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}
