import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types/api';

type CartState = {
  carts: Record<string, CartItem[]>;
  addItem: (slug: string, product: Product, quantity?: number) => void;
  reconcileCart: (slug: string, products: Product[]) => void;
  updateQuantity: (slug: string, productId: string, quantity: number) => void;
  removeItem: (slug: string, productId: string) => void;
  clearCart: (slug: string) => void;
};

function clampQuantity(quantity: number, stockQuantity?: number) {
  const normalized = Math.max(1, Math.floor(quantity));
  if (typeof stockQuantity !== 'number') return normalized;
  return Math.min(normalized, Math.max(1, stockQuantity));
}

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    id: product.id,
    name: product.name,
    image_url: product.image_url,
    price: product.price,
    quantity,
    stock_quantity: product.stock_quantity,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      carts: {},
      addItem: (slug, product, quantity = 1) =>
        set((state) => {
          const currentCart = state.carts[slug] ?? [];
          const existing = currentCart.find((item) => item.id === product.id);
          const nextCart = existing
            ? currentCart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: clampQuantity(item.quantity + quantity, product.stock_quantity),
                    }
                  : item,
              )
            : [...currentCart, toCartItem(product, clampQuantity(quantity, product.stock_quantity))];

          return {
            carts: {
              ...state.carts,
              [slug]: nextCart,
            },
          };
        }),
      reconcileCart: (slug, products) =>
        set((state) => {
          const currentCart = state.carts[slug] ?? [];
          if (currentCart.length === 0) {
            return state;
          }

          const productMap = new Map(products.filter((product) => product.is_active).map((product) => [product.id, product]));
          const nextCart = currentCart.flatMap((item) => {
            const product = productMap.get(item.id);
            if (!product) {
              return [];
            }

            return [
              toCartItem(
                product,
                clampQuantity(item.quantity, product.stock_quantity),
              ),
            ];
          });

          const unchanged =
            nextCart.length === currentCart.length &&
            nextCart.every((item, index) => {
              const existing = currentCart[index];
              return (
                existing &&
                existing.id === item.id &&
                existing.name === item.name &&
                existing.image_url === item.image_url &&
                existing.price === item.price &&
                existing.quantity === item.quantity &&
                existing.stock_quantity === item.stock_quantity
              );
            });

          if (unchanged) {
            return state;
          }

          return {
            carts: {
              ...state.carts,
              [slug]: nextCart,
            },
          };
        }),
      updateQuantity: (slug, productId, quantity) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [slug]: (state.carts[slug] ?? [])
              .map((item) =>
                item.id === productId
                  ? { ...item, quantity: clampQuantity(quantity, item.stock_quantity) }
                  : item,
              )
              .filter((item) => item.quantity > 0),
          },
        })),
      removeItem: (slug, productId) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [slug]: (state.carts[slug] ?? []).filter((item) => item.id !== productId),
          },
        })),
      clearCart: (slug) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [slug]: [],
          },
        })),
    }),
    {
      name: 'seranet-mobile-cart-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ carts: state.carts }),
    },
  ),
);
