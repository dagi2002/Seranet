import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  PlaceholderMerchant as Merchant,
  PlaceholderUser as User,
  clearPlaceholderSession,
  loadPlaceholderSession,
  placeholderFetchMerchantById,
  placeholderLogin,
  placeholderRegister,
} from '../lib/apiPlaceholders';

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
    const existingSession = loadPlaceholderSession();
    if (existingSession?.user) {
      setUser(existingSession.user);
      loadMerchantData(existingSession.user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadMerchantData = async (userId: string) => {
    const data = await placeholderFetchMerchantById(userId);
    if (data) {
      setMerchant(data);
    }
    setLoading(false);
  };

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
      // TODO: Replace with POST /auth/register from Express backend
      const { user: newUser, merchant: newMerchant } = await placeholderRegister(
        merchantData
      );
      setUser(newUser);
      setMerchant(newMerchant);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Replace with POST /auth/login from Express backend
      const session = await placeholderLogin(email, password);
      setUser(session.user);
      setMerchant(session.merchant);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    clearPlaceholderSession();    
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
