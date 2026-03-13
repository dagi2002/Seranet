export type Merchant = {
  id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  store_url_slug: string;
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

export type CartItem = {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
};

export type CreateOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{ product_id: string; quantity: number }>;
};

export type PublicOrder = {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
};

export type CheckoutOrder = PublicOrder & {
  public_access_token: string;
};

export type PublicPayment = {
  id: string;
  order_id: string;
  telebirr_txn_id?: string;
  amount: number;
  status: 'initiated' | 'pending' | 'success' | 'failed';
};

export type Payment = {
  id: string;
  order_id: string;
  amount: number;
  status: 'initiated' | 'pending' | 'success' | 'failed';
  customer_phone?: string;
};

export type LastOrderSession = {
  slug: string;
  orderId: string;
  accessToken: string;
};
