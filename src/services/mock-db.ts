import { initialDatabase } from '@/services/seed-data';
import { readStorage, STORAGE_KEYS, writeStorage } from '@/services/storage';
import type { Database, EntityMap, Merchant } from '@/types/seranet';
import { DEFAULT_PRIMARY_COLOR, generateId } from '@/utils';

const collectionMap = {
  Merchant: 'merchants',
  Product: 'products',
  Order: 'orders',
  Payment: 'payments',
} as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function ensureMockDb() {
  const existing = readStorage<Database | null>(STORAGE_KEYS.db, null);
  if (!existing) {
    writeStorage(STORAGE_KEYS.db, initialDatabase);
  }
}

export function readDb(): Database {
  ensureMockDb();
  return clone(readStorage(STORAGE_KEYS.db, initialDatabase));
}

export function writeDb(db: Database) {
  writeStorage(STORAGE_KEYS.db, db);
}

function matchRecord<T extends object>(record: T, filters: Partial<T>) {
  return Object.entries(filters).every(([key, value]) => {
    if (typeof value === 'undefined') return true;
    return record[key as keyof T] === value;
  });
}

function sortByCreatedDate<T extends { created_date?: string }>(items: T[]) {
  return [...items].sort((a, b) => (b.created_date ?? '').localeCompare(a.created_date ?? ''));
}

export function getCurrentMerchantFromDb(userEmail: string): Merchant | null {
  const db = readDb();
  return sortByCreatedDate(db.merchants.filter((merchant) => merchant.created_by === userEmail))[0] ?? null;
}

export const mockDb = {
  list<K extends keyof EntityMap>(entity: K) {
    const db = readDb();
    const collection = db[collectionMap[entity]] as EntityMap[K][];
    return sortByCreatedDate(collection as Array<{ created_date?: string }>) as EntityMap[K][];
  },

  filter<K extends keyof EntityMap>(entity: K, filters: Partial<EntityMap[K]>) {
    return this.list(entity).filter((record) => matchRecord(record, filters));
  },

  get<K extends keyof EntityMap>(entity: K, id: string) {
    return this.list(entity).find((record) => record.id === id) ?? null;
  },

  create<K extends keyof EntityMap>(entity: K, data: Partial<EntityMap[K]>) {
    const db = readDb();
    const key = collectionMap[entity];
    const now = new Date().toISOString();

    if (entity === 'Merchant') {
      const incoming = data as Partial<Merchant>;
      const slug = incoming.store_url_slug;
      if (!slug) throw new Error('Store slug is required');
      const slugExists = db.merchants.some((merchant) => merchant.store_url_slug === slug);
      if (slugExists) throw new Error('That store URL is already taken');
    }

    const record = {
      ...data,
      id: (data.id as string | undefined) ?? generateId(entity.toLowerCase()),
      created_date: (data as { created_date?: string }).created_date ?? now,
      updated_date: now,
      ...(entity === 'Merchant' ? { primary_color: DEFAULT_PRIMARY_COLOR, is_active: true } : {}),
      ...(entity === 'Product' ? { stock_quantity: 0, category: 'other', is_active: true } : {}),
      ...(entity === 'Order' ? { status: 'pending' } : {}),
      ...(entity === 'Payment' ? { status: 'initiated' } : {}),
    } as EntityMap[K];

    (db[key] as EntityMap[K][]).push(record);
    writeDb(db);
    return record;
  },

  update<K extends keyof EntityMap>(entity: K, id: string, data: Partial<EntityMap[K]>) {
    const db = readDb();
    const key = collectionMap[entity];
    const collection = db[key] as EntityMap[K][];
    const index = collection.findIndex((record) => record.id === id);

    if (index === -1) {
      throw new Error(`${entity} not found`);
    }

    if (entity === 'Merchant' && typeof (data as Partial<Merchant>).store_url_slug !== 'undefined') {
      const slug = (data as Partial<Merchant>).store_url_slug;
      if (slug && db.merchants.some((merchant) => merchant.store_url_slug === slug && merchant.id !== id)) {
        throw new Error('That store URL is already taken');
      }
    }

    collection[index] = {
      ...collection[index],
      ...data,
      updated_date: new Date().toISOString(),
    };
    writeDb(db);
    return collection[index];
  },

  remove<K extends keyof EntityMap>(entity: K, id: string) {
    const db = readDb();
    const key = collectionMap[entity];
    db[key] = (db[key] as EntityMap[K][]).filter((record) => record.id !== id) as never;
    writeDb(db);
    return { success: true };
  },
};
