import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import CheckoutPage from '@/pages/Checkout';
import { cartStorageKey } from '@/services/storage';
import { renderWithApp } from '@/test/test-utils';

describe('checkout flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    localStorage.setItem(
      cartStorageKey('addis-market-studio'),
      JSON.stringify([
        {
          id: 'prod_habesha_set',
          name: 'Habesha Coffee Set',
        price: 4200,
        quantity: 1,
        image_url: 'https://example.com/item.jpg',
        image_urls: ['https://example.com/item.jpg'],
      },
    ]),
    );
  });

  it('creates the order flow and navigates to payment success', async () => {
    vi.spyOn(apiClient.storefront, 'getMerchantBySlug').mockResolvedValue({
      id: 'merch_demo',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by: 'demo@seranet.et',
      business_name: 'Addis Market Studio',
      owner_name: 'Meklit Desta',
      phone: '0911223344',
      store_url_slug: 'addis-market-studio',
      description: 'Demo merchant',
      logo_url: 'https://example.com/logo.jpg',
      banner_url: 'https://example.com/banner.jpg',
      primary_color: '#0D9488',
      is_active: true,
      is_verified: false,
    });
    vi.spyOn(apiClient.storefront, 'getProducts').mockResolvedValue([
      {
        id: 'prod_habesha_set',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        merchant_id: 'merch_demo',
        name: 'Habesha Coffee Set',
        description: 'Coffee set',
        price: 4200,
        stock_quantity: 5,
        image_url: 'https://example.com/item.jpg',
        image_urls: ['https://example.com/item.jpg'],
        category: 'home',
        is_active: true,
      },
    ]);
    vi.spyOn(apiClient.storefront, 'getDeliveryZones').mockResolvedValue([]);
    vi.spyOn(apiClient.storefront, 'createOrder').mockResolvedValue({
      id: 'order_123',
      order_number: 'ORD-123456',
      product_total: 4200,
      delivery_fee: 0,
      total_amount: 4200,
      status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_type: 'delivery',
      public_access_token: 'public-access-token',
    });
    vi.spyOn(apiClient.payments, 'initiateTelebirr').mockResolvedValue({
      id: 'payment_123',
      created_date: new Date().toISOString(),
      order_id: 'order_123',
      merchant_id: 'merch_demo',
      amount: 4200,
      status: 'initiated',
    });

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

  it('reconciles stale cart items against live product stock and pricing before checkout', async () => {
    localStorage.setItem(
      cartStorageKey('addis-market-studio'),
      JSON.stringify([
        {
          id: 'prod_habesha_set',
          name: 'Old Product Name',
          price: 999,
          quantity: 5,
          image_url: 'https://example.com/old-item.jpg',
          image_urls: ['https://example.com/old-item.jpg'],
          stock_quantity: 5,
        },
      ]),
    );

    vi.spyOn(apiClient.storefront, 'getDeliveryZones').mockResolvedValue([]);
    vi.spyOn(apiClient.storefront, 'getMerchantBySlug').mockResolvedValue({
      id: 'merch_demo',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by: 'demo@seranet.et',
      business_name: 'Addis Market Studio',
      owner_name: 'Meklit Desta',
      phone: '0911223344',
      store_url_slug: 'addis-market-studio',
      description: 'Demo merchant',
      logo_url: 'https://example.com/logo.jpg',
      banner_url: 'https://example.com/banner.jpg',
      primary_color: '#0D9488',
      is_active: true,
      is_verified: false,
    });
    vi.spyOn(apiClient.storefront, 'getProducts').mockResolvedValue([
      {
        id: 'prod_habesha_set',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        merchant_id: 'merch_demo',
        name: 'Habesha Coffee Set',
        description: 'Coffee set',
        price: 4200,
        stock_quantity: 2,
        image_url: 'https://example.com/item.jpg',
        image_urls: ['https://example.com/item.jpg'],
        category: 'home',
        is_active: true,
      },
    ]);

    renderWithApp(
      <Routes>
        <Route path="/s/:slug/checkout" element={<CheckoutPage />} />
      </Routes>,
      { initialEntries: ['/s/addis-market-studio/checkout'] },
    );

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(cartStorageKey('addis-market-studio')) || '[]')).toMatchObject([
        {
          id: 'prod_habesha_set',
          name: 'Habesha Coffee Set',
          price: 4200,
          quantity: 2,
          image_url: 'https://example.com/item.jpg',
          stock_quantity: 2,
        },
      ]),
    );
  });

  it('updates quantity controls and removes items from the checkout cart', async () => {
    vi.spyOn(apiClient.storefront, 'getDeliveryZones').mockResolvedValue([]);
    vi.spyOn(apiClient.storefront, 'getMerchantBySlug').mockResolvedValue({
      id: 'merch_demo',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      created_by: 'demo@seranet.et',
      business_name: 'Addis Market Studio',
      owner_name: 'Meklit Desta',
      phone: '0911223344',
      store_url_slug: 'addis-market-studio',
      description: 'Demo merchant',
      logo_url: 'https://example.com/logo.jpg',
      banner_url: 'https://example.com/banner.jpg',
      primary_color: '#0D9488',
      is_active: true,
      is_verified: false,
    });
    vi.spyOn(apiClient.storefront, 'getProducts').mockResolvedValue([
      {
        id: 'prod_habesha_set',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        merchant_id: 'merch_demo',
        name: 'Habesha Coffee Set',
        description: 'Coffee set',
        price: 4200,
        stock_quantity: 5,
        image_url: 'https://example.com/item.jpg',
        image_urls: ['https://example.com/item.jpg'],
        category: 'home',
        is_active: true,
      },
    ]);

    renderWithApp(
      <Routes>
        <Route path="/s/:slug/checkout" element={<CheckoutPage />} />
      </Routes>,
      { initialEntries: ['/s/addis-market-studio/checkout'] },
    );

    await waitFor(() => expect(screen.getByText('Habesha Coffee Set')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity for Habesha Coffee Set' }));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(cartStorageKey('addis-market-studio')) || '[]')).toMatchObject([
        { id: 'prod_habesha_set', quantity: 2 },
      ]),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity for Habesha Coffee Set' }));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(cartStorageKey('addis-market-studio')) || '[]')).toMatchObject([
        { id: 'prod_habesha_set', quantity: 1 },
      ]),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Habesha Coffee Set' }));
    await waitFor(() => expect(screen.getByText('Your cart is empty')).toBeInTheDocument());
    expect(localStorage.getItem(cartStorageKey('addis-market-studio'))).toBeNull();
  });
});
