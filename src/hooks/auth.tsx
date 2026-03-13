import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { apiClient } from '@/api/apiClient';
import type { AuthUser, LoginInput, RegisterInput } from '@/types/seranet';
import { queryClient } from '@/lib/query-client';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  restoreDemo: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resetMerchantQueries() {
  queryClient.removeQueries({ queryKey: ['current-merchant'] });
  queryClient.removeQueries({ queryKey: ['merchant-products'] });
  queryClient.removeQueries({ queryKey: ['merchant-orders'] });
  queryClient.removeQueries({ queryKey: ['merchant-order'] });
  queryClient.removeQueries({ queryKey: ['merchant-payment'] });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
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
      async login(credentials) {
        const next = await apiClient.auth.login(credentials);
        resetMerchantQueries();
        flushSync(() => {
          setUser(next.user);
        });
      },
      async register(payload) {
        const next = await apiClient.auth.register(payload);
        resetMerchantQueries();
        flushSync(() => {
          setUser(next.user);
        });
      },
      async restoreDemo() {
        const next = await apiClient.auth.restoreDemo();
        resetMerchantQueries();
        flushSync(() => {
          setUser(next);
        });
      },
      async logout() {
        await apiClient.auth.logout();
        resetMerchantQueries();
        flushSync(() => {
          setUser(null);
        });
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
