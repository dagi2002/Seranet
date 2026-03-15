import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LandingPage from '@/pages/Landing';
import { renderWithApp } from '@/test/test-utils';
import type { AuthResponse, AuthUser, Merchant } from '@/types/seranet';

const { authApi, merchantApi } = vi.hoisted(() => ({
  authApi: {
    me: vi.fn<() => Promise<AuthUser | null>>(),
    login: vi.fn<(credentials: { email: string; password: string }) => Promise<AuthResponse>>(),
    register: vi.fn(),
    restoreDemo: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    redirectToLogin: vi.fn(),
    currentMerchant: vi.fn(),
  },
  merchantApi: {
    getCurrent: vi.fn<() => Promise<Merchant | null>>(),
  },
}));

vi.mock('@/api/apiClient', () => ({
  apiClient: {
    auth: authApi,
    merchants: merchantApi,
  },
}));

const merchant: Merchant = {
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
  is_verified: false,
};

const user: AuthUser = {
  id: 'user_demo',
  email: 'demo@seranet.et',
  full_name: 'Meklit Desta',
  role: 'admin',
};

describe('landing login modal', () => {
  beforeEach(() => {
    authApi.me.mockResolvedValue(null);
    authApi.login.mockReset();
    authApi.login.mockResolvedValue({
      token: 'token-value',
      user,
      merchant,
    });
    merchantApi.getCurrent.mockResolvedValue(null);
  });

  it('clears stale password state and submits the pasted password value exactly', async () => {
    renderWithApp(
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<p>dashboard</p>} />
      </Routes>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Merchant Login' }));

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'merchant@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    fireEvent.click(screen.getByRole('button', { name: 'Merchant Login' }));

    const reopenedPasswordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(reopenedPasswordInput.value).toBe('');

    fireEvent.change(reopenedPasswordInput, { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'merchant@example.com',
        password: 'ab',
      }),
    );
  });
});
