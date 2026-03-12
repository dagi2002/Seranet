import { demoUser } from '@/services/seed-data';
import { getCurrentMerchantFromDb, mockDb } from '@/services/mock-db';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from '@/services/storage';
import type { DemoUser, EntityMap } from '@/types/seranet';

function ensureDemoUser() {
  const user = readStorage<DemoUser | null>(STORAGE_KEYS.user, null);
  if (!user) writeStorage(STORAGE_KEYS.user, demoUser);
}

type EntityApi<K extends keyof EntityMap> = {
  list: () => Promise<EntityMap[K][]>;
  filter: (filters: Partial<EntityMap[K]>) => Promise<EntityMap[K][]>;
  get: (id: string) => Promise<EntityMap[K] | null>;
  create: (data: Partial<EntityMap[K]>) => Promise<EntityMap[K]>;
  update: (id: string, data: Partial<EntityMap[K]>) => Promise<EntityMap[K]>;
  remove: (id: string) => Promise<{ success: boolean }>;
};

function entityApi<K extends keyof EntityMap>(entity: K): EntityApi<K> {
  return {
    list: async () => mockDb.list(entity),
    filter: async (filters) => mockDb.filter(entity, filters),
    get: async (id) => mockDb.get(entity, id),
    create: async (data) => mockDb.create(entity, data),
    update: async (id, data) => mockDb.update(entity, id, data),
    remove: async (id) => mockDb.remove(entity, id),
  };
}

export const apiClient = {
  entities: {
    Merchant: entityApi('Merchant'),
    Product: entityApi('Product'),
    Order: entityApi('Order'),
    Payment: entityApi('Payment'),
  },
  auth: {
    async me() {
      ensureDemoUser();
      return readStorage<DemoUser | null>(STORAGE_KEYS.user, demoUser);
    },
    async isAuthenticated() {
      ensureDemoUser();
      return Boolean(readStorage<DemoUser | null>(STORAGE_KEYS.user, null));
    },
    async restoreDemo() {
      writeStorage(STORAGE_KEYS.user, demoUser);
      return demoUser;
    },
    async updateMe(data: Partial<DemoUser>) {
      const current = (await this.me()) ?? demoUser;
      const next = { ...current, ...data };
      writeStorage(STORAGE_KEYS.user, next);
      return next;
    },
    async logout() {
      removeStorage(STORAGE_KEYS.user);
    },
    async redirectToLogin() {},
    async currentMerchant() {
      const user = await this.me();
      if (!user) return null;
      return getCurrentMerchantFromDb(user.email);
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }: { file: File }) {
        const file_url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Upload failed'));
          reader.readAsDataURL(file);
        });

        return { file_url };
      },
    },
  },
};
