import type { CartItem } from '../../types/api';

const EMPTY_CART_ITEMS: CartItem[] = [];

export function getCartItems(carts: Record<string, CartItem[]>, slug: string) {
  return carts[slug] ?? EMPTY_CART_ITEMS;
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
