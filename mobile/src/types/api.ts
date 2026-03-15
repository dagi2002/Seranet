export type PaymentProvider = 'telebirr' | 'cash_on_delivery' | 'bank_transfer';

export type FulfillmentStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

export type FulfillmentType = 'delivery' | 'pickup';

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

export type DeliveryZone = {
  id: string;
  merchant_id: string;
  name: string;
  fee: number;
  is_active: boolean;
};

export type CreateOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{ product_id: string; quantity: number }>;
  payment_method: PaymentProvider;
  delivery_zone_id?: string;
  landmark_note?: string;
  bank_transfer_ref?: string;
};

export type PublicOrder = {
  id: string;
  order_number: string;
  product_total: number;
  delivery_fee: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
  fulfillment_status: FulfillmentStatus;
  fulfillment_type: FulfillmentType;
};

export type CheckoutOrder = PublicOrder & {
  public_access_token: string;
};

export type PublicPayment = {
  id: string;
  order_id: string;
  provider?: PaymentProvider;
  telebirr_txn_id?: string;
  bank_transfer_ref?: string;
  amount: number;
  status: 'initiated' | 'pending' | 'success' | 'failed';
  confirmed_by_merchant_at?: string;
};

export type Payment = {
  id: string;
  order_id: string;
  provider?: PaymentProvider;
  amount: number;
  status: 'initiated' | 'pending' | 'success' | 'failed';
  customer_phone?: string;
  bank_transfer_ref?: string;
};

export type LastOrderSession = {
  slug: string;
  orderId: string;
  accessToken: string;
};
