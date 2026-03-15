import { env } from '../config/env';
import { resolveAssetUrl } from '../lib/asset-url';
import type { CheckoutOrder, CreateOrderInput, DeliveryZone, Merchant, Product, PublicOrder, PublicPayment } from '../types/api';
import { apiRequest } from './client';

function normalizeMerchant(merchant: Merchant) {
  if (!env) return merchant;

  return {
    ...merchant,
    logo_url: resolveAssetUrl(merchant.logo_url, env.EXPO_PUBLIC_API_BASE_URL),
    banner_url: resolveAssetUrl(merchant.banner_url, env.EXPO_PUBLIC_API_BASE_URL),
  };
}

function normalizeProduct(product: Product) {
  if (!env) return product;
  const apiBaseUrl = env.EXPO_PUBLIC_API_BASE_URL;

  const rawImageUrls = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];

  return {
    ...product,
    image_url: resolveAssetUrl(product.image_url ?? rawImageUrls[0], apiBaseUrl),
    image_urls: rawImageUrls.map((url) => resolveAssetUrl(url, apiBaseUrl) ?? url),
  };
}

export const storefrontApi = {
  async getMerchant(slug: string) {
    const merchant = await apiRequest<Merchant>(`/storefront/${slug}`);
    return normalizeMerchant(merchant);
  },
  async getProducts(slug: string) {
    const products = await apiRequest<Product[]>(`/storefront/${slug}/products`);
    return products.map(normalizeProduct);
  },
  async getProduct(slug: string, productId: string) {
    const product = await apiRequest<Product>(`/storefront/${slug}/products/${productId}`);
    return normalizeProduct(product);
  },
  createOrder(slug: string, payload: CreateOrderInput) {
    return apiRequest<CheckoutOrder>(`/storefront/${slug}/orders`, {
      method: 'POST',
      body: payload,
    });
  },
  getOrder(slug: string, orderId: string, accessToken: string) {
    return apiRequest<PublicOrder>(
      `/storefront/${slug}/orders/${orderId}?access_token=${encodeURIComponent(accessToken)}`,
    );
  },
  getPayment(slug: string, orderId: string, accessToken: string) {
    return apiRequest<PublicPayment>(
      `/storefront/${slug}/orders/${orderId}/payment?access_token=${encodeURIComponent(accessToken)}`,
    );
  },
  getDeliveryZones(slug: string) {
    return apiRequest<DeliveryZone[]>(`/storefront/${slug}/delivery-zones`);
  },
};
