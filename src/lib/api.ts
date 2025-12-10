import type { Merchant, Order, OrderItem, PaymentResponse, Product, User } from './types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const MERCHANT_KEY = 'merchant';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).slice(2, 10);
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

let users: User[] = [
  {
    id: 'user_demo',
    email: 'demo@seranet.com',
  },
];

let merchants: Merchant[] = [
  {
    id: 'merchant_demo',
    business_name: 'Seranet Demo Shop',
    owner_name: 'Demo Owner',
    email: 'demo@seranet.com',
    phone: '0900000000',
    store_url_slug: 'demo-shop',
    logo_url: null,
    store_description: 'Beautiful Ethiopian products ready for checkout.',
    primary_color: '#2563eb',
  },
];

let products: Product[] = [
  {
    id: 'prod_coffee',
    merchant_id: 'merchant_demo',
    name: 'Ethiopian Coffee Beans',
    description: 'Freshly roasted Yirgacheffe beans with floral and citrus notes.',
    price: 350,
    stock_quantity: 25,
    image_url:
      'https://images.pexels.com/photos/302911/pexels-photo-302911.jpeg?auto=compress&cs=tinysrgb&w=1200',
    is_active: true,
  },
  {
    id: 'prod_scarf',
    merchant_id: 'merchant_demo',
    name: 'Handwoven Ethiopian Scarf',
    description: 'Traditional gabi made by local artisans in Addis Ababa.',
    price: 480,
    stock_quantity: 12,
    image_url:
      'https://images.pexels.com/photos/6311613/pexels-photo-6311613.jpeg?auto=compress&cs=tinysrgb&w=1200',
    is_active: true,
  },
];

let orders: Order[] = [];

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

function attachProductDetails(items: Partial<OrderItem>[] | undefined) {
  if (!items) return [] as OrderItem[];

  return items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      id: generateId(),
      order_id: item.order_id ?? '',
      product_id: item.product_id ?? '',
      quantity: item.quantity ?? 1,
      price_at_purchase: item.price_at_purchase ?? product?.price ?? 0,
      product: {
        name: product?.name ?? 'Product',
        image_url: product?.image_url ?? null,
      },
    } satisfies OrderItem;
  });
}

export const api = {
  async login(email: string, _password: string) {
    await delay();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const merchant = merchants.find((m) => m.email === email) ?? merchants[0] ?? null;
    const token = `demo-token-${user.id}`;

    saveToken(token);
    saveUser(user);
    saveMerchant(merchant ?? null);

    return { token, user, merchant };
  },

  async register(email: string, _password: string) {
    await delay();

    if (users.some((u) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const user: User = {
      id: generateId(),
      email,
    };

    users.push(user);

    const token = `demo-token-${user.id}`;
    saveToken(token);
    saveUser(user);

    const existingMerchant = merchants.find((m) => m.email === email) ?? null;
    saveMerchant(existingMerchant);

    return { token, user, merchant: existingMerchant };
  },

  async getMerchants() {
    await delay();
    return merchants;
  },

  async createMerchant(name: string) {
    await delay();
    const slug = slugify(name) || `store-${generateId()}`;

    const merchant: Merchant = {
      id: generateId(),
      business_name: name,
      owner_name: '',
      email: '',
      phone: '',
      store_url_slug: slug,
      logo_url: null,
      store_description: null,
      primary_color: '#2563eb',
    };

    merchants.push(merchant);
    saveMerchant(merchant);
    return merchant;
  },

  async updateMerchant(id: string, updates: Partial<Merchant>) {
    await delay();
    merchants = merchants.map((m) => (m.id === id ? { ...m, ...updates } : m));
    const updated = merchants.find((m) => m.id === id) ?? null;
    saveMerchant(updated);
    return updated;
  },

  async getProducts(merchantId?: string) {
    await delay();
    if (!merchantId) return products;
    return products.filter((p) => p.merchant_id === merchantId);
  },

  async getProductById(productId: string) {
    await delay();
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async createProduct(product: Partial<Product>) {
    await delay();

    if (!product.merchant_id) {
      throw new Error('Merchant is required');
    }

    if (product.id) {
      products = products.map((p) => (p.id === product.id ? { ...p, ...product } : p));
      const updated = products.find((p) => p.id === product.id);
      if (!updated) {
        throw new Error('Product not found');
      }
      return updated;
    }

    const newProduct: Product = {
      id: generateId(),
      name: product.name ?? 'New Product',
      description: product.description ?? '',
      price: product.price ?? 0,
      stock_quantity: product.stock_quantity ?? 0,
      image_url: product.image_url ?? null,
      is_active: product.is_active ?? true,
      merchant_id: product.merchant_id,
    };

    products.push(newProduct);
    return newProduct;
  },

  async deleteProduct(productId: string) {
    await delay();
    products = products.filter((p) => p.id !== productId);
  },

  async getOrders(merchantId?: string) {
    await delay();
    if (!merchantId) return orders;
    return orders.filter((o) => o.merchant_id === merchantId);
  },

  async getOrder(orderId: string) {
    await delay();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  },

  async createOrder(payload: Partial<Order> & { items?: Partial<OrderItem>[] }) {
    await delay();

    if (!payload.merchant_id) {
      throw new Error('Merchant is required');
    }

    const items = attachProductDetails(payload.items);

    const order: Order = {
      id: generateId(),
      merchant_id: payload.merchant_id,
      customer_name: payload.customer_name ?? 'Customer',
      customer_phone: payload.customer_phone ?? '',
      customer_address: payload.customer_address ?? null,
      order_status: 'pending',
      total_amount: payload.total_amount ?? 0,
      created_at: new Date().toISOString(),
      items,
    };

    orders.push(order);
    return order;
  },

  async updateOrderStatus(orderId: string, newStatus: Order['order_status']) {
    await delay();
    orders = orders.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o));
    const updated = orders.find((o) => o.id === orderId);
    if (!updated) {
      throw new Error('Order not found');
    }
    return updated;
  },

  async demoPayment(orderId: string, amount: number, customerPhone?: string): Promise<PaymentResponse> {
    await delay(1200);
    orders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            order_status: 'paid',
            payment: {
              telebirr_txn_id: generateId(),
              status: 'paid',
              created_at: new Date().toISOString(),
            },
          }
        : o
    );

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    return {
      order,
      amount,
      customerPhone,
      message: 'Demo Telebirr payment completed',
    } satisfies PaymentResponse;
  },

  async getMerchantBySlug(slug: string) {
    await delay();
    return merchants.find((m) => m.store_url_slug === slug) ?? null;
  },
};
