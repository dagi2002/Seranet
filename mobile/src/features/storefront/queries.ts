import { useMutation, useQuery } from '@tanstack/react-query';
import type { CreateOrderInput } from '../../types/api';
import { storefrontApi } from '../../api/storefront';

export function useMerchantQuery(slug: string) {
  return useQuery({
    queryKey: ['merchant', slug],
    queryFn: () => storefrontApi.getMerchant(slug),
    enabled: Boolean(slug),
  });
}

export function useProductsQuery(slug: string) {
  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => storefrontApi.getProducts(slug),
    enabled: Boolean(slug),
  });
}

export function useProductQuery(slug: string, productId: string) {
  return useQuery({
    queryKey: ['product', slug, productId],
    queryFn: () => storefrontApi.getProduct(slug, productId),
    enabled: Boolean(slug && productId),
  });
}

export function useCreateOrderMutation(slug: string) {
  return useMutation({
    mutationFn: (payload: CreateOrderInput) => storefrontApi.createOrder(slug, payload),
  });
}
