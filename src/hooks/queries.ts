import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

export function useCurrentMerchant() {
  return useQuery({
    queryKey: ['current-merchant'],
    queryFn: () => apiClient.auth.currentMerchant(),
  });
}

export function useMerchantBySlug(slug: string) {
  return useQuery({
    queryKey: ['merchant', slug],
    queryFn: async () => {
      const [merchant] = await apiClient.entities.Merchant.filter({ store_url_slug: slug });
      return merchant ?? null;
    },
    enabled: Boolean(slug),
  });
}

export function useProductsByMerchant(merchantId?: string, onlyActive?: boolean) {
  return useQuery({
    queryKey: ['products', merchantId, onlyActive],
    queryFn: async () => {
      if (!merchantId) return [];
      const products = await apiClient.entities.Product.filter({ merchant_id: merchantId });
      return onlyActive ? products.filter((product) => product.is_active) : products;
    },
    enabled: Boolean(merchantId),
  });
}

export function useOrdersByMerchant(merchantId?: string) {
  return useQuery({
    queryKey: ['orders', merchantId],
    queryFn: async () => {
      if (!merchantId) return [];
      return apiClient.entities.Order.filter({ merchant_id: merchantId });
    },
    enabled: Boolean(merchantId),
  });
}

export function useOrder(orderId?: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => (orderId ? apiClient.entities.Order.get(orderId) : Promise.resolve(null)),
    enabled: Boolean(orderId),
  });
}

export function usePaymentByOrder(orderId?: string) {
  return useQuery({
    queryKey: ['payment', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const [payment] = await apiClient.entities.Payment.filter({ order_id: orderId });
      return payment ?? null;
    },
    enabled: Boolean(orderId),
  });
}

export function useProduct(productId?: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => (productId ? apiClient.entities.Product.get(productId) : Promise.resolve(null)),
    enabled: Boolean(productId),
  });
}
