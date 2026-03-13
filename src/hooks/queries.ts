import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

type QueryOptions = {
  refetchInterval?: number | false;
};

export function useCurrentMerchant() {
  return useQuery({
    queryKey: ['current-merchant'],
    queryFn: () => apiClient.merchants.getCurrent(),
  });
}

export function useMerchantBySlug(slug: string) {
  return useQuery({
    queryKey: ['merchant', slug],
    queryFn: () => apiClient.storefront.getMerchantBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCurrentMerchantProducts() {
  return useQuery({
    queryKey: ['merchant-products'],
    queryFn: () => apiClient.products.listCurrentMerchant(),
  });
}

export function useStorefrontProducts(slug: string) {
  return useQuery({
    queryKey: ['storefront-products', slug],
    queryFn: () => apiClient.storefront.getProducts(slug),
    enabled: Boolean(slug),
  });
}

export function useCurrentMerchantOrders() {
  return useQuery({
    queryKey: ['merchant-orders'],
    queryFn: () => apiClient.orders.listCurrentMerchant(),
  });
}

export function useCurrentMerchantOrder(orderId?: string) {
  return useQuery({
    queryKey: ['merchant-order', orderId],
    queryFn: () => (orderId ? apiClient.orders.getCurrentMerchant(orderId) : Promise.resolve(null)),
    enabled: Boolean(orderId),
  });
}

export function useStorefrontOrder(slug: string, orderId?: string, accessToken?: string, options?: QueryOptions) {
  return useQuery({
    queryKey: ['storefront-order', slug, orderId, accessToken],
    queryFn: () => (orderId && accessToken ? apiClient.storefront.getOrder(slug, orderId, accessToken) : Promise.resolve(null)),
    enabled: Boolean(slug && orderId && accessToken),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCurrentMerchantPayment(orderId?: string) {
  return useQuery({
    queryKey: ['merchant-payment', orderId],
    queryFn: () => (orderId ? apiClient.payments.getCurrentMerchantOrderPayment(orderId) : Promise.resolve(null)),
    enabled: Boolean(orderId),
  });
}

export function useStorefrontPayment(slug: string, orderId?: string, accessToken?: string, options?: QueryOptions) {
  return useQuery({
    queryKey: ['storefront-payment', slug, orderId, accessToken],
    queryFn: () => (orderId && accessToken ? apiClient.storefront.getPayment(slug, orderId, accessToken) : Promise.resolve(null)),
    enabled: Boolean(slug && orderId && accessToken),
    refetchInterval: options?.refetchInterval,
  });
}

export function useStorefrontProduct(slug: string, productId?: string) {
  return useQuery({
    queryKey: ['storefront-product', slug, productId],
    queryFn: () => (productId ? apiClient.storefront.getProduct(slug, productId) : Promise.resolve(null)),
    enabled: Boolean(slug && productId),
  });
}
