import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import OnboardingPage from '@/pages/Onboarding';
import { STORAGE_KEYS } from '@/services/storage';
import { renderWithApp } from '@/test/test-utils';

describe('onboarding flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores onboarding data and navigates to the completion route', async () => {
    renderWithApp(
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/complete" element={<p>completion route</p>} />
      </Routes>,
      { initialEntries: ['/onboarding'] },
    );

    fireEvent.change(screen.getByPlaceholderText('Abeba Home Goods'), { target: { value: 'Selam Styles' } });
    fireEvent.change(screen.getByPlaceholderText('Abeba Bekele'), { target: { value: 'Selam Tesfaye' } });
    fireEvent.change(screen.getByPlaceholderText('abeba@example.com'), { target: { value: 'selam@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'strongpass1' } });
    fireEvent.change(screen.getByPlaceholderText('Repeat password'), { target: { value: 'strongpass1' } });
    fireEvent.change(screen.getByPlaceholderText('0911223344'), { target: { value: '0911445566' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(screen.getByDisplayValue('selam-styles')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => expect(screen.getByText(/brand touch and launch summary/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /launch store/i }));

    await waitFor(() => expect(screen.getByText('completion route')).toBeInTheDocument());

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.onboarding) || '{}')).toMatchObject({
      business_name: 'Selam Styles',
      email: 'selam@example.com',
      store_url_slug: 'selam-styles',
    });
  });
});
