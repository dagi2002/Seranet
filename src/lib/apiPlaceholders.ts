import type { Merchant, Order, OrderItem, Product, User, PaymentResponse } from './types';

const API_BASE_URL = 'http://localhost:4000';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const MERCHANT_KEY = 'merchant';

function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

function saveUser(user: User | null) {
  if (typeof localStorage === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function saveMerchant(merchant: Merchant | null) {
  if (typeof localStorage === 'undefined') return;
  if (merchant) {
    localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant));
  } else {
    localStorage.removeItem(MERCHANT_KEY);
  }
}

function authHeaders() {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    const message = (data as { message?: string }).message ?? 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export function loadStoredSession() {
  if (typeof localStorage === 'undefined') {
    return { token: null, user: null, merchant: null } as const;
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const merchantRaw = localStorage.getItem(MERCHANT_KEY);

  return {
    token,
    user: userRaw ? (JSON.parse(userRaw) as User) : null,
    merchant: merchantRaw ? (JSON.parse(merchantRaw) as Merchant) : null,
  } as const;
}

export function clearStoredSession() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MERCHANT_KEY);
}

export const api = {
  async login(email: string, password: string) {
    console.log('Logging in user via backend…');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse<{ token: string; user?: User; merchant?: Merchant }>(response);

    if (data.token) {
      saveToken(data.token);
    }
    if (data.user) {
      saveUser(data.user);
    }
    if (data.merchant) {
      saveMerchant(data.merchant);
    }

    return data;
  },

  async register(email: string, password: string) {
    console.log('Registering user via backend…');
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse<{ token: string; user?: User; merchant?: Merchant }>(response);

    if (data.token) {
      saveToken(data.token);
    }
    if (data.user) {
      saveUser(data.user);
    }
    if (data.merchant) {
      saveMerchant(data.merchant);
    }

    return data;
  },

  async getMerchants() {
    console.log('Fetching merchants…');
    const response = await fetch(`${API_BASE_URL}/merchants`, {
      headers: { ...authHeaders() },
    });
    return handleResponse<Merchant[]>(response);
  },

  async createMerchant(name: string) {
    console.log('Creating merchant…');
    const response = await fetch(`${API_BASE_URL}/merchants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name }),
    });
    const data = await handleResponse<Merchant>(response);
    saveMerchant(data);
    return data;
  },

  async updateMerchant(id: string, updates: Partial<Merchant>) {
    console.log('Updating merchant…');
    const response = await fetch(`${API_BASE_URL}/merchants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<Merchant>(response);
    saveMerchant(data);
    return data;
  },

  async getProducts(merchantId?: string) {
    console.log('Fetching products…');
    const query = merchantId ? `?merchantId=${merchantId}` : '';
    const response = await fetch(`${API_BASE_URL}/products${query}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse<Product[]>(response);
  },

  async getProductById(productId: string) {
    console.log('Fetching product by id…');
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse<Product>(response);
  },

  async createProduct(product: Partial<Product>) {
    console.log('Creating or updating product…');
    const { id, ...rest } = product;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(rest),
    });
    return handleResponse<Product>(response);
  },

  async deleteProduct(productId: string) {
    console.log('Deleting product…');
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message ?? 'Failed to delete product');
    }
  },

  async getOrders(merchantId?: string) {
    console.log('Fetching orders…');
    const query = merchantId ? `?merchantId=${merchantId}` : '';
    const response = await fetch(`${API_BASE_URL}/orders${query}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse<Order[]>(response);
  },

  async getOrder(orderId: string) {
    console.log('Fetching order details…');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { ...authHeaders() },
    });
    return handleResponse<Order>(response);
  },

  async createOrder(payload: Partial<Order> & { items?: Partial<OrderItem>[] }) {
    console.log('Creating order…');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(response);
  },

  async updateOrderStatus(orderId: string, newStatus: Order['order_status']) {
    console.log('Updating order status…');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ order_status: newStatus }),
    });
    return handleResponse<Order>(response);
  },

  async demoPayment(orderId: string, amount: number, customerPhone?: string) {
    console.log('Creating demo payment…');
    const response = await fetch(`${API_BASE_URL}/payments/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ orderId, amount, customerPhone }),
    });
    return handleResponse<PaymentResponse>(response);
  },

  async getMerchantBySlug(slug: string) {
    console.log('Fetching merchant by slug…');
    const response = await fetch(`${API_BASE_URL}/merchants?slug=${slug}`, {
      headers: { ...authHeaders() },
    });
    const merchants = await handleResponse<Merchant[]>(response);
    return merchants.find((merchant) => merchant.store_url_slug === slug) ?? null;
  },
};
