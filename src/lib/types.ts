export type User = {
  id: string;
  email: string;
};

export type Merchant = {
  id: string;
  business_name: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  store_url_slug: string;
  logo_url?: string | null;
  store_description?: string | null;
  primary_color?: string;
};

export type Product = {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  image_url?: string | null;
  is_active?: boolean;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: { name: string; image_url: string | null };
};

export type Order = {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  order_status: 'pending' | 'paid' | 'cancelled' | 'fulfilled';
  total_amount: number;
  created_at?: string;
  items?: OrderItem[];
  payment?: {
    telebirr_txn_id: string | null;
    status: string;
    created_at: string;
  };
};

export type PaymentResponse = {
  order: Order;
  amount: number;
  customerPhone?: string;
  message?: string;
};
