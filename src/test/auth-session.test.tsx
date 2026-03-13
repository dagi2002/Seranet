import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/auth';
import { useCurrentMerchant } from '@/hooks/queries';
import { renderWithApp } from '@/test/test-utils';
import type { AuthResponse, AuthUser, Merchant } from '@/types/seranet';

const { authApi, merchantApi } = vi.hoisted(() => ({
  authApi: {
    me: vi.fn<() => Promise<AuthUser | null>>(),
    login: vi.fn<(credentials: { email: string; password: string }) => Promise<AuthResponse>>(),
    register: vi.fn(),
    restoreDemo: vi.fn<() => Promise<AuthUser>>(),
    logout: vi.fn<() => Promise<void>>(),
    isAuthenticated: vi.fn(),
    redirectToLogin: vi.fn(),
    currentMerchant: vi.fn(),
  },
  merchantApi: {
    getCurrent: vi.fn<() => Promise<Merchant | null>>(),
  },
}));

const demoUser: AuthUser = {
  id: 'user_demo',
  email: 'demo@seranet.et',
  full_name: 'Meklit Desta',
  role: 'admin',
};

const newUser: AuthUser = {
  id: 'user_new',
  email: 'fresh@example.com',
  full_name: 'Fresh Merchant',
  role: 'admin',
};

const demoMerchant: Merchant = {
  id: 'merchant_demo',
  created_date: '2026-03-13T00:00:00.000Z',
  updated_date: '2026-03-13T00:00:00.000Z',
  created_by: 'demo@seranet.et',
  business_name: 'Addis Market Studio',
  owner_name: 'Meklit Desta',
  phone: '0911223344',
  store_url_slug: 'addis-market-studio',
  description: 'Demo merchant',
  primary_color: '#0D9488',
  is_active: true,
};

const freshMerchant: Merchant = {
  id: 'merchant_new',
  created_date: '2026-03-13T00:00:00.000Z',
  updated_date: '2026-03-13T00:00:00.000Z',
  created_by: 'fresh@example.com',
  business_name: 'Fresh Market',
  owner_name: 'Fresh Merchant',
  phone: '0911001100',
  store_url_slug: 'fresh-market',
  description: 'Fresh merchant',
  primary_color: '#0D9488',
  is_active: true,
};

vi.mock('@/api/apiClient', () => ({
  apiClient: {
    auth: authApi,
    merchants: merchantApi,
  },
}));

function Home() {
  const navigate = useNavigate();
  const { login, logout, restoreDemo } = useAuth();

  return (
    <div>
      <button
        onClick={async () => {
          await restoreDemo();
          navigate('/dashboard');
        }}
      >
        Demo Login
      </button>
      <button
        onClick={async () => {
          await login({ email: 'fresh@example.com', password: 'QaPass123!' });
          navigate('/dashboard');
        }}
      >
        Fresh Login
      </button>
      <button
        onClick={async () => {
          await logout();
          navigate('/');
        }}
      >
        Logout
      </button>
    </div>
  );
}

function ProtectedDashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate replace to="/" />;

  return <DashboardProbe />;
}

function DashboardProbe() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: merchant, isLoading } = useCurrentMerchant();

  if (isLoading) return <p>Loading merchant...</p>;
  return (
    <div>
      <p>{merchant?.business_name ?? 'No merchant'}</p>
      <button
        onClick={async () => {
          await logout();
          navigate('/');
        }}
      >
        Logout
      </button>
    </div>
  );
}

describe('auth session flow', () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.me.mockResolvedValue(null);
    authApi.register.mockReset();
    authApi.isAuthenticated.mockReset();
    authApi.redirectToLogin.mockReset();
    authApi.currentMerchant.mockReset();
    authApi.logout.mockResolvedValue(undefined);
    authApi.restoreDemo.mockResolvedValue(demoUser);
    authApi.login.mockImplementation(async ({ email }) => ({
      token: 'token-value',
      user: email === 'fresh@example.com' ? newUser : demoUser,
      merchant: email === 'fresh@example.com' ? freshMerchant : demoMerchant,
    }));

    let activeMerchant: Merchant | null = null;
    authApi.restoreDemo.mockImplementation(async () => {
      activeMerchant = demoMerchant;
      return demoUser;
    });
    authApi.login.mockImplementation(async ({ email }) => {
      activeMerchant = email === 'fresh@example.com' ? freshMerchant : demoMerchant;
      return {
        token: 'token-value',
        user: email === 'fresh@example.com' ? newUser : demoUser,
        merchant: activeMerchant,
      };
    });
    authApi.logout.mockImplementation(async () => {
      activeMerchant = null;
    });
    merchantApi.getCurrent.mockImplementation(async () => activeMerchant);
  });

  it('keeps dashboard access stable across demo login, logout, and a second login', async () => {
    renderWithApp(
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
      </Routes>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Demo Login' }));
    await waitFor(() => expect(screen.getByText('Addis Market Studio')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Fresh Login' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Fresh Login' }));
    await waitFor(() => expect(screen.getByText('Fresh Market')).toBeInTheDocument());
  });
});
