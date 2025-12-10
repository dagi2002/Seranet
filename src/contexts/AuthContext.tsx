import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, clearStoredSession, loadStoredSession } from '../lib/api';
import type { Merchant, User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  signUp: (email: string, password: string, merchantData: {
    business_name: string;
    owner_name: string;
    phone: string;
    store_url_slug: string;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingSession = loadStoredSession();
    if (existingSession.user) {
      setUser(existingSession.user);
    }
    if (existingSession.merchant) {
      setMerchant(existingSession.merchant);
    }
    setLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    merchantData: {
      business_name: string;
      owner_name: string;
      phone: string;
      store_url_slug: string;
    }
  ) => {
    try {
      const { user: newUser, merchant: newMerchant } = await api.register(
        email,
        password
      );

      if (newUser) {
        setUser(newUser);
      }

      let merchantRecord = newMerchant ?? null;

      if (!merchantRecord && merchantData.business_name) {
        merchantRecord = await api.createMerchant(merchantData.business_name);
      }

      if (merchantRecord) {
        const updatedMerchant = await api.updateMerchant(merchantRecord.id, {
          ...merchantRecord,
          ...merchantData,
        });
        setMerchant(updatedMerchant);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const session = await api.login(email, password);
      const stored = loadStoredSession();

      setUser(session.user ?? stored.user ?? null);
      setMerchant(session.merchant ?? stored.merchant ?? null);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    clearStoredSession();
    setMerchant(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, merchant, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
