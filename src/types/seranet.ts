export type Merchant = {
  id: string;
  created_date: string;
  updated_date: string;
  created_by: string;
  business_name: string;
  owner_name?: string;
  phone?: string;
  store_url_slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color: string;
  is_active: boolean;
};

export type ProductCategory =
  | 'clothing'
  | 'electronics'
  | 'food'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'other';

export type Product = {
  id: string;
  created_date: string;
  updated_date: string;
  merchant_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  category: ProductCategory;
  is_active: boolean;
};

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
};

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'fulfilled';

export type Order = {
  id: string;
  created_date: string;
  updated_date: string;
  merchant_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
};

export type PaymentStatus = 'initiated' | 'pending' | 'success' | 'failed';

export type Payment = {
  id: string;
  created_date: string;
  order_id: string;
  merchant_id?: string;
  telebirr_txn_id?: string;
  amount: number;
  status: PaymentStatus;
  customer_phone?: string;
  callback_payload?: string;
};

export type DemoUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
};

export type CartItem = {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
};

export type Database = {
  merchants: Merchant[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
};

export type EntityMap = {
  Merchant: Merchant;
  Product: Product;
  Order: Order;
  Payment: Payment;
};
