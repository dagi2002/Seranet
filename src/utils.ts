import { format } from 'date-fns';
import type { FulfillmentStatus, OrderStatus, PaymentProvider, PaymentStatus, ProductCategory } from '@/types/seranet';

export const createPageUrl = (pageName: string) => `/${pageName}`;

export const DEFAULT_PRIMARY_COLOR = '#0D9488';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food' },
  { value: 'home', label: 'Home' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

export const MERCHANT_COLOR_SWATCHES = ['#0D9488', '#059669', '#0F766E', '#2563EB', '#EA580C', '#BE123C'];
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) => format(new Date(value), 'MMM d, yyyy');

export const formatDateTime = (value: string) => format(new Date(value), 'MMM d, yyyy h:mm a');

export const generateId = (prefix: string) =>
  `${prefix}_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;

export const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

export const clampQuantity = (value: number) => Math.max(1, Math.floor(Number.isFinite(value) ? value : 1));

export const statusLabel = (status: OrderStatus | PaymentStatus | FulfillmentStatus) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export const fulfillmentLabel = (status: FulfillmentStatus) => FULFILLMENT_LABELS[status];

const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  telebirr: 'Telebirr',
  cash_on_delivery: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
};

export const paymentProviderLabel = (provider?: PaymentProvider) =>
  provider ? PAYMENT_PROVIDER_LABELS[provider] : 'Unknown';

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateImageFile = (file: File, label = 'Image') => {
  if (!file.type.startsWith('image/')) {
    return `${label} must be an image file`;
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `${label} must be 5 MB or smaller`;
  }

  return null;
};
