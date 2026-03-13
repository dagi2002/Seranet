import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { storefrontApi } from '../../api/storefront';

export function useInitiatePaymentMutation() {
  return useMutation({
    mutationFn: ({ orderId, customerPhone }: { orderId: string; customerPhone?: string }) =>
      paymentsApi.initiateTelebirr(orderId, customerPhone),
  });
}

export function useOrderStatusQuery(slug: string, orderId: string, accessToken: string) {
  return useQuery({
    queryKey: ['order-status', slug, orderId, accessToken],
    queryFn: () => storefrontApi.getOrder(slug, orderId, accessToken),
    enabled: Boolean(slug && orderId && accessToken),
    refetchInterval: 3000,
  });
}

export function usePaymentStatusQuery(slug: string, orderId: string, accessToken: string) {
  return useQuery({
    queryKey: ['payment-status', slug, orderId, accessToken],
    queryFn: () => storefrontApi.getPayment(slug, orderId, accessToken),
    enabled: Boolean(slug && orderId && accessToken),
    retry: false,
    refetchInterval: 3000,
  });
}
