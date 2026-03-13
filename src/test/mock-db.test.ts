import { beforeEach, describe, expect, it } from 'vitest';
import { getCurrentMerchantFromDb, readDb } from '@/services/mock-db';
import { STORAGE_KEYS } from '@/services/storage';

describe('mock api client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds the demo merchant on first read', () => {
    const db = readDb();
    expect(db.merchants.length).toBeGreaterThan(0);
    expect(db.merchants[0]?.store_url_slug).toBe('addis-market-studio');
  });

  it('returns the newest merchant for the current user email', () => {
    localStorage.removeItem(STORAGE_KEYS.db);
    const merchant = getCurrentMerchantFromDb('demo@seranet.et');
    expect(merchant?.store_url_slug).toBe('addis-market-studio');
  });
});
