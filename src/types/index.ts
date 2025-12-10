export type Merchant = {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  storeSlug: string;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

export type Order = {
  id: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

export type Payment = {
  id: string;
  orderId: string;
  merchantId: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  payload: unknown;
  createdAt: string;
};
