import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Merchant {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  store_url_slug: string;
  logo_url: string | null;
  store_description: string | null;
  primary_color: string;
}

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMerchantData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMerchantData(session.user.id);
      } else {
        setMerchant(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadMerchantData = async (userId: string) => {
    const { data, error } = await supabase
      .from('merchants')
      .select('id, business_name, owner_name, email, phone, store_url_slug, logo_url, store_description, primary_color')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: authData.user.id,
          email,
          ...merchantData,
           // Placeholder to satisfy non-null constraint; Supabase Auth manages real passwords
           password_hash: 'managed-by-supabase-auth',
        });

      if (merchantError) throw merchantError;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMerchant(null);
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
