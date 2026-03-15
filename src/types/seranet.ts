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
  is_verified: boolean;
  verified_at?: string;
  support_phone?: string;
  store_policy?: string;
  return_policy?: string;
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
  image_urls: string[];
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
export type FulfillmentStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
export type FulfillmentType = 'delivery' | 'pickup';
export type PaymentProvider = 'telebirr' | 'cash_on_delivery' | 'bank_transfer';

export type Order = {
  id: string;
  created_date: string;
  updated_date: string;
  merchant_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  landmark_note?: string;
  items: OrderItem[];
  product_total: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  fulfillment_type: FulfillmentType;
  delivery_zone_id?: string;
};

export type PublicOrder = {
  id: string;
  order_number: string;
  product_total: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  fulfillment_type: FulfillmentType;
};

export type DeliveryZone = {
  id: string;
  merchant_id: string;
  name: string;
  fee: number;
  is_active: boolean;
  created_date: string;
  updated_date: string;
};

export type CheckoutOrder = PublicOrder & {
  public_access_token: string;
};

export type PaymentStatus = 'initiated' | 'pending' | 'success' | 'failed';

export type Payment = {
  id: string;
  created_date: string;
  order_id: string;
  merchant_id?: string;
  provider?: PaymentProvider;
  telebirr_txn_id?: string;
  amount: number;
  status: PaymentStatus;
  customer_phone?: string;
  callback_payload?: string;
  bank_transfer_ref?: string;
  confirmed_by_merchant_at?: string;
};

export type PublicPayment = {
  id: string;
  order_id: string;
  provider?: PaymentProvider;
  telebirr_txn_id?: string;
  amount: number;
  status: PaymentStatus;
  confirmed_by_merchant_at?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
};

export type DemoUser = AuthUser;

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  full_name: string;
  email: string;
  password: string;
  merchant: {
    business_name: string;
    owner_name?: string;
    phone?: string;
    store_url_slug: string;
    description?: string;
    logo_url?: string;
    banner_url?: string;
  };
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  merchant: Merchant | null;
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
