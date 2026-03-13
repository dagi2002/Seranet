import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LastOrderSession } from '../types/api';

type SessionState = {
  lastOrderBySlug: Record<string, LastOrderSession>;
  setLastOrder: (session: LastOrderSession) => void;
  clearLastOrder: (slug: string) => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      lastOrderBySlug: {},
      setLastOrder: (session) =>
        set((state) => ({
          lastOrderBySlug: {
            ...state.lastOrderBySlug,
            [session.slug]: session,
          },
        })),
      clearLastOrder: (slug) =>
        set((state) => {
          const next = { ...state.lastOrderBySlug };
          delete next[slug];
          return { lastOrderBySlug: next };
        }),
    }),
    {
      name: 'seranet-mobile-session-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lastOrderBySlug: state.lastOrderBySlug }),
    },
  ),
);
