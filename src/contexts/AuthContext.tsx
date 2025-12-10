import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import type { Merchant } from '../types';

type AuthContextValue = {
  user: Merchant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    businessName: string;
    ownerName: string;
    phone: string;
    storeSlug: string;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Merchant | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('seranet_token'));

  useEffect(() => {
    if (token) {
      refresh().catch(() => logout());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; merchant: Merchant }>('/auth/login', { email, password });
    localStorage.setItem('seranet_token', data.token);
    setToken(data.token);
    setUser(data.merchant);
  };

  const register = async (payload: {
    email: string;
    password: string;
    businessName: string;
    ownerName: string;
    phone: string;
    storeSlug: string;
  }) => {
    const { data } = await api.post<{ token: string; merchant: Merchant }>('/auth/register', payload);
    localStorage.setItem('seranet_token', data.token);
    setToken(data.token);
    setUser(data.merchant);
  };

  const refresh = async () => {
    if (!token) return;
    const { data } = await api.get<Merchant>('/auth/me');
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('seranet_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
