import { ReactNode } from 'react';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Orders } from '../pages/Orders';
import { StoreSettings } from '../pages/StoreSettings';
import { Storefront } from '../pages/Storefront';
import { ProductDetail } from '../pages/ProductDetail';
import { Checkout } from '../pages/Checkout';
import { CheckoutSuccess } from '../pages/CheckoutSuccess';
import { ProtectedRoute } from './auth/ProtectedRoute';

function getPath(): string {
  return window.location.pathname;
}

function getQueryParam(param: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

export function Router(): ReactNode {
  const path = getPath();

  if (path === '/' || path === '/login') {
    return <Login />;
  }

  if (path === '/register') {
    return <Register />;
  }

  if (path === '/dashboard') {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  if (path === '/products') {
    return (
      <ProtectedRoute>
        <Products />
      </ProtectedRoute>
    );
  }

  if (path === '/orders') {
    return (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    );
  }

  if (path === '/settings') {
    return (
      <ProtectedRoute>
        <StoreSettings />
      </ProtectedRoute>
    );
  }

  if (path.startsWith('/store/')) {
    const slug = path.split('/store/')[1]?.split('/')[0];
    const productId = getQueryParam('product');

    if (productId) {
      return <ProductDetail slug={slug} productId={productId} />;
    }

    return <Storefront slug={slug} />;
  }

  if (path === '/checkout') {
    const slug = getQueryParam('store');
    return <Checkout slug={slug || ''} />;
  }

  if (path === '/checkout-success') {
    return <CheckoutSuccess />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a href="/" className="text-blue-600 hover:text-blue-700">
          Go back home
        </a>
      </div>
    </div>
  );
}
