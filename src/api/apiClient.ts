import { readTextStorage, removeStorage, STORAGE_KEYS, writeTextStorage } from '@/services/storage';
import type {
  AuthResponse,
  AuthUser,
  CheckoutOrder,
  LoginInput,
  Merchant,
  Order,
  Payment,
  PublicOrder,
  PublicPayment,
  Product,
  RegisterInput,
} from '@/types/seranet';

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = 'http://localhost:4000/api';
  return (configured || fallback).replace(/\/+$/, '');
}

const API_BASE_URL = getApiBaseUrl();
const API_ORIGIN = API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')
  ? new URL(API_BASE_URL).origin
  : null;
const DEMO_EMAIL = 'demo@seranet.et';
const DEMO_PASSWORD = 'demo12345';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
  isFormData?: boolean;
};

function getAuthToken() {
  return readTextStorage(STORAGE_KEYS.authToken);
}

function setAuthToken(token: string) {
  writeTextStorage(STORAGE_KEYS.authToken, token);
}

function clearAuthToken() {
  removeStorage(STORAGE_KEYS.authToken);
}

function resolveAssetUrl(url?: string) {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  if (API_ORIGIN) {
    return `${API_ORIGIN}${normalizedPath}`;
  }

  if (typeof window !== 'undefined') {
    return new URL(normalizedPath, window.location.origin).toString();
  }

  return normalizedPath;
}

function normalizeMerchant(merchant: Merchant | null) {
  if (!merchant) return null;

  return {
    ...merchant,
    logo_url: resolveAssetUrl(merchant.logo_url),
    banner_url: resolveAssetUrl(merchant.banner_url),
  };
}

function normalizeProduct(product: Product | null) {
  if (!product) return null;

  const rawImageUrls = Array.isArray(product.image_urls)
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];
  const imageUrls = rawImageUrls.map((url) => resolveAssetUrl(url) ?? url);
  const primaryImageUrl = resolveAssetUrl(product.image_url) ?? imageUrls[0];

  return {
    ...product,
    image_url: primaryImageUrl,
    image_urls: imageUrls,
  };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (!options.isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      typeof options.body === 'undefined'
        ? undefined
        : options.isFormData
          ? (options.body as BodyInit)
          : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const error = (await response.json()) as { message?: string };
      if (error.message) message = error.message;
    } catch {
      // Ignore JSON parsing failures for non-JSON errors.
    }

    if (response.status === 401) {
      clearAuthToken();
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  auth: {
    async me(): Promise<AuthUser | null> {
      if (!getAuthToken()) return null;

      try {
        return await request<AuthUser>('/auth/me');
      } catch (error) {
        if (error instanceof Error && error.message === 'Invalid token') {
          clearAuthToken();
          return null;
        }
        throw error;
      }
    },
    async login(credentials: LoginInput) {
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      setAuthToken(response.token);
      return {
        ...response,
        merchant: normalizeMerchant(response.merchant),
      };
    },
    async register(payload: RegisterInput) {
      const response = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: payload,
      });
      setAuthToken(response.token);
      return {
        ...response,
        merchant: normalizeMerchant(response.merchant),
      };
    },
    async isAuthenticated() {
      return Boolean(await this.me());
    },
    async restoreDemo() {
      const response = await this.login({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      return response.user;
    },
    async logout() {
      clearAuthToken();
    },
    async redirectToLogin() {},
    async currentMerchant() {
      return apiClient.merchants.getCurrent();
    },
  },
  merchants: {
    async getCurrent() {
      if (!getAuthToken()) return null;

      try {
        const merchant = await request<Merchant>('/merchants/me');
        return normalizeMerchant(merchant);
      } catch (error) {
        if (error instanceof Error && /token|Merchant not found/i.test(error.message)) {
          return null;
        }
        throw error;
      }
    },
    async updateCurrent(data: Partial<Merchant>) {
      const merchant = await request<Merchant>('/merchants/me', {
        method: 'PATCH',
        body: data,
      });
      return normalizeMerchant(merchant)!;
    },
  },
  storefront: {
    async getMerchantBySlug(slug: string) {
      const merchant = await request<Merchant>(`/storefront/${slug}`);
      return normalizeMerchant(merchant);
    },
    async getProducts(slug: string) {
      const products = await request<Product[]>(`/storefront/${slug}/products`);
      return products.map((product) => normalizeProduct(product)!);
    },
    async getProduct(slug: string, productId: string) {
      const product = await request<Product>(`/storefront/${slug}/products/${productId}`);
      return normalizeProduct(product);
    },
    async createOrder(
      slug: string,
      payload: {
        customer_name: string;
        customer_phone: string;
        customer_address: string;
        items: Array<{ product_id: string; quantity: number }>;
      },
    ) {
      return request<CheckoutOrder>(`/storefront/${slug}/orders`, {
        method: 'POST',
        body: payload,
      });
    },
    async getOrder(slug: string, orderId: string, accessToken: string) {
      return request<PublicOrder>(`/storefront/${slug}/orders/${orderId}?access_token=${encodeURIComponent(accessToken)}`);
    },
    async getPayment(slug: string, orderId: string, accessToken: string) {
      return request<PublicPayment>(
        `/storefront/${slug}/orders/${orderId}/payment?access_token=${encodeURIComponent(accessToken)}`,
      );
    },
  },
  products: {
    async listCurrentMerchant() {
      const products = await request<Product[]>('/merchants/me/products');
      return products.map((product) => normalizeProduct(product)!);
    },
    async create(data: Partial<Product>) {
      const product = await request<Product>('/merchants/me/products', {
        method: 'POST',
        body: data,
      });
      return normalizeProduct(product);
    },
    async update(id: string, data: Partial<Product>) {
      const product = await request<Product>(`/merchants/me/products/${id}`, {
        method: 'PATCH',
        body: data,
      });
      return normalizeProduct(product);
    },
    async remove(id: string) {
      return request<{ success: boolean }>(`/merchants/me/products/${id}`, {
        method: 'DELETE',
      });
    },
  },
  orders: {
    async listCurrentMerchant() {
      return request<Order[]>('/merchants/me/orders');
    },
    async getCurrentMerchant(orderId: string) {
      return request<Order>(`/merchants/me/orders/${orderId}`);
    },
    async updateStatus(orderId: string, status: Order['status']) {
      return request<Order>(`/merchants/me/orders/${orderId}`, {
        method: 'PATCH',
        body: { status },
      });
    },
  },
  payments: {
    async getCurrentMerchantOrderPayment(orderId: string) {
      return request<Payment>(`/merchants/me/orders/${orderId}/payment`);
    },
    async initiateTelebirr(orderId: string, customerPhone?: string) {
      return request<Payment>('/payments/telebirr/initiate', {
        method: 'POST',
        body: {
          order_id: orderId,
          customer_phone: customerPhone,
        },
      });
    },
    async simulateTelebirrSuccess(paymentId: string) {
      return request<Payment>(`/payments/telebirr/simulate/${paymentId}`, {
        method: 'POST',
      });
    },
  },
  uploads: {
    async uploadOnboardingLogo(file: File) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await request<{ file_url: string }>('/uploads/onboarding-logo', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      return {
        file_url: resolveAssetUrl(response.file_url)!,
      };
    },
    async uploadMerchantLogo(file: File) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await request<{ file_url: string }>('/uploads/merchant-logo', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      return {
        file_url: resolveAssetUrl(response.file_url)!,
      };
    },
    async uploadMerchantBanner(file: File) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await request<{ file_url: string }>('/uploads/merchant-banner', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      return {
        file_url: resolveAssetUrl(response.file_url)!,
      };
    },
    async uploadProductImage(file: File) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await request<{ file_url: string }>('/uploads/product-image', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      return {
        file_url: resolveAssetUrl(response.file_url)!,
      };
    },
  },
};
