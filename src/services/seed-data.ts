import type { Database, DemoUser, Merchant, Order, Payment, Product } from '@/types/seranet';

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const demoUser: DemoUser = {
  id: 'demo-user',
  email: 'demo@seranet.et',
  full_name: 'Meklit Desta',
  role: 'admin',
};

export const demoMerchant: Merchant = {
  id: 'merch_demo',
  created_date: hoursAgo(48),
  updated_date: hoursAgo(3),
  created_by: demoUser.email,
  business_name: 'Addis Market Studio',
  owner_name: 'Meklit Desta',
  phone: '0911223344',
  store_url_slug: 'addis-market-studio',
  description:
    'Curated Ethiopian lifestyle goods, everyday essentials, and digital-first customer service for fast local delivery.',
  logo_url:
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80',
  banner_url:
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
  primary_color: '#0D9488',
  is_active: true,
  is_verified: false,
};

export const demoProducts: Product[] = [
  {
    id: 'prod_habesha_set',
    created_date: hoursAgo(40),
    updated_date: hoursAgo(6),
    merchant_id: demoMerchant.id,
    name: 'Habesha Coffee Set',
    description: 'Hand-finished ceramic jebena set designed for modern coffee ceremonies.',
    price: 4200,
    stock_quantity: 12,
    image_url:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'home',
    is_active: true,
  },
  {
    id: 'prod_tele_case',
    created_date: hoursAgo(38),
    updated_date: hoursAgo(8),
    merchant_id: demoMerchant.id,
    name: 'Telebirr Green Phone Case',
    description: 'Slim matte phone case with bold emerald finish and soft-touch grip.',
    price: 950,
    stock_quantity: 24,
    image_url:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'electronics',
    is_active: true,
  },
  {
    id: 'prod_buna_box',
    created_date: hoursAgo(36),
    updated_date: hoursAgo(9),
    merchant_id: demoMerchant.id,
    name: 'Roasted Buna Gift Box',
    description: 'Fresh-roasted Ethiopian coffee beans with tasting notes and gift wrap.',
    price: 1600,
    stock_quantity: 0,
    image_url:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'food',
    is_active: true,
  },
  {
    id: 'prod_scarf',
    created_date: hoursAgo(28),
    updated_date: hoursAgo(10),
    merchant_id: demoMerchant.id,
    name: 'Addis Woven Scarf',
    description: 'Lightweight cotton scarf with handwoven border detail.',
    price: 1300,
    stock_quantity: 17,
    image_url:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'clothing',
    is_active: true,
  },
  {
    id: 'prod_soap',
    created_date: hoursAgo(26),
    updated_date: hoursAgo(5),
    merchant_id: demoMerchant.id,
    name: 'Shea + Tena Adam Soap',
    description: 'Small-batch beauty bar with botanical oils and a clean herbal finish.',
    price: 420,
    stock_quantity: 46,
    image_url:
      'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'beauty',
    is_active: true,
  },
  {
    id: 'prod_bottle',
    created_date: hoursAgo(22),
    updated_date: hoursAgo(2),
    merchant_id: demoMerchant.id,
    name: 'Trail Water Bottle',
    description: 'Insulated steel bottle built for long commutes and weekend hikes.',
    price: 1450,
    stock_quantity: 8,
    image_url:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
    image_urls: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
    ],
    category: 'sports',
    is_active: true,
  },
];

export const demoOrders: Order[] = [
  {
    id: 'order_pending',
    created_date: hoursAgo(7),
    updated_date: hoursAgo(7),
    merchant_id: demoMerchant.id,
    order_number: 'ORD-PEND123',
    customer_name: 'Selamawit Tekle',
    customer_phone: '0911887766',
    customer_address: 'Bole, Addis Ababa',
    items: [
      {
        product_id: 'prod_habesha_set',
        product_name: 'Habesha Coffee Set',
        quantity: 1,
        price_at_purchase: 4200,
      },
    ],
    total_amount: 4200,
    product_total: 4200,
    delivery_fee: 0,
    fulfillment_status: 'pending',
    fulfillment_type: 'delivery',
    status: 'pending',
  },
  {
    id: 'order_paid',
    created_date: hoursAgo(18),
    updated_date: hoursAgo(15),
    merchant_id: demoMerchant.id,
    order_number: 'ORD-PAID456',
    customer_name: 'Abel Girma',
    customer_phone: '0913002200',
    customer_address: 'CMC, Addis Ababa',
    items: [
      {
        product_id: 'prod_tele_case',
        product_name: 'Telebirr Green Phone Case',
        quantity: 2,
        price_at_purchase: 950,
      },
      {
        product_id: 'prod_soap',
        product_name: 'Shea + Tena Adam Soap',
        quantity: 3,
        price_at_purchase: 420,
      },
    ],
    total_amount: 3160,
    product_total: 3160,
    delivery_fee: 0,
    fulfillment_status: 'confirmed',
    fulfillment_type: 'delivery',
    status: 'paid',
  },
  {
    id: 'order_fulfilled',
    created_date: hoursAgo(32),
    updated_date: hoursAgo(24),
    merchant_id: demoMerchant.id,
    order_number: 'ORD-FULL789',
    customer_name: 'Rahel Endale',
    customer_phone: '0914557788',
    customer_address: 'Piassa, Addis Ababa',
    items: [
      {
        product_id: 'prod_scarf',
        product_name: 'Addis Woven Scarf',
        quantity: 2,
        price_at_purchase: 1300,
      },
    ],
    total_amount: 2600,
    product_total: 2600,
    delivery_fee: 0,
    fulfillment_status: 'delivered',
    fulfillment_type: 'delivery',
    status: 'fulfilled',
  },
  {
    id: 'order_cancelled',
    created_date: hoursAgo(50),
    updated_date: hoursAgo(45),
    merchant_id: demoMerchant.id,
    order_number: 'ORD-CANC246',
    customer_name: 'Meron Hailu',
    customer_phone: '0919331100',
    customer_address: 'Kazanchis, Addis Ababa',
    items: [
      {
        product_id: 'prod_bottle',
        product_name: 'Trail Water Bottle',
        quantity: 1,
        price_at_purchase: 1450,
      },
    ],
    total_amount: 1450,
    product_total: 1450,
    delivery_fee: 0,
    fulfillment_status: 'pending',
    fulfillment_type: 'delivery',
    status: 'cancelled',
  },
];

export const demoPayments: Payment[] = [
  {
    id: 'payment_pending',
    created_date: hoursAgo(7),
    order_id: 'order_pending',
    merchant_id: demoMerchant.id,
    amount: 4200,
    status: 'initiated',
    customer_phone: '0911887766',
  },
  {
    id: 'payment_success',
    created_date: hoursAgo(18),
    order_id: 'order_paid',
    merchant_id: demoMerchant.id,
    telebirr_txn_id: 'TB-DEMO-222',
    amount: 3160,
    status: 'success',
    customer_phone: '0913002200',
    callback_payload: '{"status":"success"}',
  },
];

export const initialDatabase: Database = {
  merchants: [demoMerchant],
  products: demoProducts,
  orders: demoOrders,
  payments: demoPayments,
};
