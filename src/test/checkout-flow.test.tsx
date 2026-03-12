import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import CheckoutPage from '@/pages/Checkout';
import { cartStorageKey } from '@/services/storage';
import { renderWithApp } from '@/test/test-utils';

describe('checkout flow', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      cartStorageKey('addis-market-studio'),
      JSON.stringify([
        {
          id: 'prod_habesha_set',
          name: 'Habesha Coffee Set',
          price: 4200,
          quantity: 1,
          image_url: 'https://example.com/item.jpg',
        },
      ]),
    );
  });

  it('creates the order flow and navigates to payment success', async () => {
    renderWithApp(
      <Routes>
        <Route path="/s/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/s/:slug/payment-success/:orderId" element={<p>payment success route</p>} />
      </Routes>,
      { initialEntries: ['/s/addis-market-studio/checkout'] },
    );

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Selamawit Tekle' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '0911887766' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Bole, Addis Ababa' } });
    fireEvent.click(screen.getByRole('button', { name: /pay with telebirr/i }));

    await waitFor(() => expect(screen.getByText('payment success route')).toBeInTheDocument());
    expect(localStorage.getItem(cartStorageKey('addis-market-studio'))).toBeNull();
  });
});
