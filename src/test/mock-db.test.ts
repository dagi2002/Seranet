import { beforeEach, describe, expect, it } from 'vitest';
import { apiClient } from '@/api/apiClient';
import { readDb } from '@/services/mock-db';
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

  it('rejects duplicate merchant slugs', async () => {
    localStorage.removeItem(STORAGE_KEYS.db);

    await expect(
      apiClient.entities.Merchant.create({
        created_by: 'demo@seranet.et',
        business_name: 'Duplicate Demo',
        store_url_slug: 'addis-market-studio',
      }),
    ).rejects.toThrow('already taken');
  });
});
