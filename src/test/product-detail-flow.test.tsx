import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Link, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/apiClient';
import CheckoutPage from '@/pages/Checkout';
import ProductDetailPage from '@/pages/ProductDetail';
import { cartStorageKey } from '@/services/storage';
import { renderWithApp } from '@/test/test-utils';

const merchant = {
  id: 'merch_demo',
  created_date: new Date().toISOString(),
  updated_date: new Date().toISOString(),
  created_by: 'demo@seranet.et',
  business_name: 'Dagi Ertib',
  owner_name: 'Dagem A',
  phone: '0911223344',
  store_url_slug: 'dagi-ertib',
  description: 'Demo merchant',
  logo_url: 'https://example.com/logo.jpg',
  banner_url: 'https://example.com/banner.jpg',
  primary_color: '#0D9488',
  is_active: true,
  is_verified: false,
} as const;

const products = [
  {
    id: 'product_a',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    merchant_id: 'merch_demo',
    name: 'Coffee Set',
    description: 'First product',
    price: 4200,
    stock_quantity: 5,
    image_url: 'https://example.com/a.jpg',
    image_urls: ['https://example.com/a.jpg', 'https://example.com/a-2.jpg'],
    category: 'home' as const,
    is_active: true,
  },
  {
    id: 'product_b',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    merchant_id: 'merch_demo',
    name: 'Green Phone Case',
    description: 'Second product',
    price: 950,
    stock_quantity: 8,
    image_url: 'https://example.com/b.jpg',
    image_urls: ['https://example.com/b.jpg'],
    category: 'electronics' as const,
    is_active: true,
  },
];

function ProductDetailHarness() {
  return (
    <>
      <nav>
        <Link to="/s/dagi-ertib/products/product_a">Open product A</Link>
        <Link to="/s/dagi-ertib/products/product_b">Open product B</Link>
      </nav>
      <Routes>
        <Route path="/s/:slug/products/:productId" element={<ProductDetailPage />} />
        <Route path="/s/:slug/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  );
}

describe('product detail storefront flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(apiClient.storefront, 'getMerchantBySlug').mockResolvedValue(merchant);
    vi.spyOn(apiClient.storefront, 'getProducts').mockResolvedValue(products);
    vi.spyOn(apiClient.storefront, 'getProduct').mockImplementation(async (_slug, productId) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    });
  });

  it('resets quantity and gallery selection when the product changes and exposes a working cart entry point', async () => {
    renderWithApp(<ProductDetailHarness />, {
      initialEntries: ['/s/dagi-ertib/products/product_a'],
    });

    await waitFor(() => expect(screen.getByText('Coffee Set')).toBeInTheDocument());
    expect(screen.getByAltText('Coffee Set')).toHaveAttribute('src', 'https://example.com/a.jpg');

    fireEvent.click(screen.getByAltText('Coffee Set view 2'));
    expect(screen.getByAltText('Coffee Set')).toHaveAttribute('src', 'https://example.com/a-2.jpg');

    fireEvent.click(screen.getByLabelText('Increase quantity'));
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Open product B' }));
    await waitFor(() => expect(screen.getByText('Green Phone Case')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByAltText('Green Phone Case')).toHaveAttribute('src', 'https://example.com/b.jpg');
    expect(screen.queryByAltText('Green Phone Case view 2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(cartStorageKey('dagi-ertib')) || '[]')).toMatchObject([
        {
          id: 'product_b',
          quantity: 1,
        },
      ]),
    );

    expect(screen.getByRole('link', { name: /cart 1/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /cart 1/i }));
    await waitFor(() => expect(screen.getByText('Order summary')).toBeInTheDocument());
    expect(screen.getByText('Green Phone Case')).toBeInTheDocument();
  });
});
