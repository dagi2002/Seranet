export interface PlaceholderUser {
    id: string;
    email: string;
  }
  
  export interface PlaceholderMerchant {
    id: string;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    store_url_slug: string;
    logo_url: string | null;
    store_description: string | null;
    primary_color: string;
  }
  
  export interface PlaceholderProduct {
    id: string;
    merchant_id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url: string | null;
    is_active: boolean;
  }
  
  export interface PlaceholderOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
      name: string;
      image_url: string | null;
    };
  }
  
  export interface PlaceholderOrder {
    id: string;
    merchant_id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string | null;
    order_status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
    total_amount: number;
    created_at: string;
    items: PlaceholderOrderItem[];
    payment?: {
      telebirr_txn_id: string | null;
      status: string;
      created_at: string;
    };
  }
  
  const demoMerchant: PlaceholderMerchant = {
    id: 'demo-merchant',
    business_name: 'Demo Store',
    owner_name: 'Demo Owner',
    email: 'merchant@example.com',
    phone: '0912345678',
    store_url_slug: 'demo-store',
    logo_url: null,
    store_description: 'This is a demo storefront. Replace with live data from your Express backend.',
    primary_color: '#2563eb',
  };
  
  let demoProducts: PlaceholderProduct[] = [
    {
      id: 'product-1',
      merchant_id: demoMerchant.id,
      name: 'Demo Hoodie',
      description: 'A cozy hoodie to showcase your storefront UI.',
      price: 1200,
      stock_quantity: 8,
      image_url: null,
      is_active: true,
    },
    {
      id: 'product-2',
      merchant_id: demoMerchant.id,
      name: 'Demo Sneakers',
      description: 'Comfortable sneakers for everyday wear.',
      price: 1800,
      stock_quantity: 5,
      image_url: null,
      is_active: true,
    },
  ];
  
  let demoOrders: PlaceholderOrder[] = [
    {
      id: 'order-1',
      merchant_id: demoMerchant.id,
      customer_name: 'Alemu Bekele',
      customer_phone: '0911001100',
      customer_address: 'Addis Ababa',
      order_status: 'paid',
      total_amount: 1800,
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'order-item-1',
          order_id: 'order-1',
          product_id: 'product-2',
          quantity: 1,
          price_at_purchase: 1800,
          product: {
            name: 'Demo Sneakers',
            image_url: null,
          },
        },
      ],
      payment: {
        telebirr_txn_id: 'TB-DEMO-001',
        status: 'success',
        created_at: new Date().toISOString(),
      },
    },
  ];
  
  const sessionKey = 'seranet_placeholder_session';
  
  type SessionPayload = {
    user: PlaceholderUser;
    merchant: PlaceholderMerchant;
  };
  
  function saveSession(session: SessionPayload) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(sessionKey, JSON.stringify(session));
  }
  
  function loadSession(): SessionPayload | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(sessionKey);
    return raw ? (JSON.parse(raw) as SessionPayload) : null;
  }
  
  export function loadPlaceholderSession() {
    return loadSession();
  }
  
  export function clearPlaceholderSession() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(sessionKey);
  }
  
  export async function placeholderRegister(
    email: string,
    _password: string,
    merchantData: Pick<PlaceholderMerchant, 'business_name' | 'owner_name' | 'phone' | 'store_url_slug'>
  ): Promise<{ user: PlaceholderUser; merchant: PlaceholderMerchant }> {
    // TODO: Replace with POST /auth/register from Express backend
    const user: PlaceholderUser = {
      id: `user-${Date.now()}`,
      email,
    };
  
    const merchant: PlaceholderMerchant = {
      ...demoMerchant,
      ...merchantData,
      email,
      id: user.id,
    };
  
    saveSession({ user, merchant });
    return { user, merchant };
  }
  
  export async function placeholderLogin(email: string, _password: string): Promise<SessionPayload> {
    // TODO: Replace with POST /auth/login from Express backend
    const existing = loadSession();
    if (existing) {
      return existing;
    }
  
    const user: PlaceholderUser = { id: demoMerchant.id, email };
    const merchant = { ...demoMerchant, email };
    const session = { user, merchant };
    saveSession(session);
    return session;
  }
  
  export async function placeholderFetchMerchantById(userId: string) {
    // TODO: Replace with GET /merchants from Express backend
    const session = loadSession();
    if (session?.merchant.id === userId) {
      return session.merchant;
    }
    return { ...demoMerchant, id: userId };
  }
  
  export async function placeholderFetchMerchantBySlug(slug: string) {
    // TODO: Replace with GET /merchants from Express backend
    const session = loadSession();
    if (session?.merchant.store_url_slug === slug) {
      return session.merchant;
    }
    if (slug === demoMerchant.store_url_slug) {
      return demoMerchant;
    }
    return null;
  }
  
  export async function placeholderUpdateMerchant(
    merchantId: string,
    updates: Partial<Pick<PlaceholderMerchant, 'business_name' | 'store_description' | 'logo_url' | 'primary_color'>>
  ) {
    // TODO: Replace with PUT /merchants from Express backend
    if (loadSession()?.merchant.id === merchantId) {
      const current = loadSession();
      if (current) {
        const updated = { ...current.merchant, ...updates };
        saveSession({ ...current, merchant: updated });
        return { merchant: updated, error: null } as const;
      }
    }
  
    demoMerchant.business_name = updates.business_name ?? demoMerchant.business_name;
    demoMerchant.store_description = updates.store_description ?? demoMerchant.store_description;
    demoMerchant.logo_url = updates.logo_url ?? demoMerchant.logo_url;
    demoMerchant.primary_color = updates.primary_color ?? demoMerchant.primary_color;
    return { merchant: demoMerchant, error: null } as const;
  }
  
  export async function placeholderFetchProducts(merchantId: string) {
    // TODO: Replace with GET /products from Express backend
    return demoProducts.filter((product) => product.merchant_id === merchantId && product.is_active);
  }
  
  export async function placeholderFetchProductById(productId: string, merchantId: string) {
    // TODO: Replace with GET /products from Express backend
    return demoProducts.find((product) => product.id === productId && product.merchant_id === merchantId && product.is_active) || null;
  }
  
  export async function placeholderUpsertProduct(
    product: Omit<PlaceholderProduct, 'id'> & { id?: string }
  ): Promise<{ product: PlaceholderProduct; error: Error | null }> {
    // TODO: Replace with POST/PUT /products from Express backend
    if (product.id) {
      const index = demoProducts.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        demoProducts[index] = { ...demoProducts[index], ...product, id: product.id };
        return { product: demoProducts[index], error: null };
      }
    }
  
    const newProduct: PlaceholderProduct = {
      ...product,
      id: product.id ?? `product-${Date.now()}`,
    };
    demoProducts = [newProduct, ...demoProducts];
    return { product: newProduct, error: null };
  }
  
  export async function placeholderDeleteProduct(productId: string) {
    // TODO: Replace with DELETE /products from Express backend
    demoProducts = demoProducts.filter((product) => product.id !== productId);
  }
  
  export async function placeholderFetchOrders(merchantId: string) {
    // TODO: Replace with GET /orders from Express backend
    return demoOrders
      .filter((order) => order.merchant_id === merchantId)
      .map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })) }));
  }
  
  export async function placeholderFetchOrderDetails(orderId: string) {
    // TODO: Replace with GET /orders from Express backend
    return demoOrders.find((order) => order.id === orderId) ?? null;
  }
  
  export async function placeholderUpdateOrderStatus(orderId: string, newStatus: PlaceholderOrder['order_status']) {
    // TODO: Replace with PUT /orders from Express backend
    const order = demoOrders.find((o) => o.id === orderId);
    if (order) {
      order.order_status = newStatus;
    }
  }
  
  export async function placeholderCreateOrder(
    merchantId: string,
    payload: Pick<PlaceholderOrder, 'customer_name' | 'customer_phone' | 'customer_address' | 'total_amount'>
  ) {
    // TODO: Replace with POST /orders from Express backend
    const orderId = `order-${Date.now()}`;
    const newOrder: PlaceholderOrder = {
      id: orderId,
      merchant_id: merchantId,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_address: payload.customer_address,
      order_status: 'pending',
      total_amount: payload.total_amount,
      created_at: new Date().toISOString(),
      items: [],
    };
    demoOrders = [newOrder, ...demoOrders];
    return newOrder;
  }
  
  export async function placeholderCreateOrderItems(orderId: string, items: Omit<PlaceholderOrderItem, 'id' | 'product'>[]) {
    // TODO: Replace with POST /orders from Express backend
    const order = demoOrders.find((o) => o.id === orderId);
    if (!order) return;
  
    const expanded = items.map((item) => {
      const product = demoProducts.find((p) => p.id === item.product_id);
      return {
        ...item,
        id: `order-item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        product: {
          name: product?.name ?? 'Unknown product',
          image_url: product?.image_url ?? null,
        },
      } satisfies PlaceholderOrderItem;
    });
  
    order.items = expanded;
  }
  
  export async function placeholderCreateDemoPayment(orderId: string, amount: number, customerPhone: string) {
    // TODO: Replace with POST /payments/demo from Express backend
    const order = demoOrders.find((o) => o.id === orderId);
    if (!order) return;
  
    order.payment = {
      telebirr_txn_id: `TB-${Date.now()}`,
      status: 'success',
      created_at: new Date().toISOString(),
    };
    order.order_status = 'paid';
  
    return { order, amount, customerPhone };
  }