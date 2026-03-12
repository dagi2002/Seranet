import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import type { DemoUser } from '@/types/seranet';

type AuthContextValue = {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  restoreDemo: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiClient.auth
      .me()
      .then((value) => {
        if (mounted) setUser(value);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async restoreDemo() {
        const next = await apiClient.auth.restoreDemo();
        setUser(next);
      },
      async logout() {
        await apiClient.auth.logout();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
