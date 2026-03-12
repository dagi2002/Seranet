import { createContext, useContext, useMemo, useState } from 'react';
import { cartStorageKey, readStorage, removeStorage, writeStorage } from '@/services/storage';
import type { CartItem, Product } from '@/types/seranet';
import { clampQuantity } from '@/utils';

type CartContextValue = {
  getCart: (slug: string) => CartItem[];
  setQuantity: (slug: string, productId: string, quantity: number) => void;
  addItem: (slug: string, product: Product, quantity?: number) => void;
  removeItem: (slug: string, productId: string) => void;
  clearCart: (slug: string) => void;
  itemCount: (slug: string) => number;
  totalAmount: (slug: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(slug: string) {
  return readStorage<CartItem[]>(cartStorageKey(slug), []);
}

function clampCartQuantity(quantity: number, stockQuantity?: number) {
  const normalized = clampQuantity(quantity);
  if (typeof stockQuantity !== 'number') return normalized;
  return Math.min(normalized, Math.max(1, stockQuantity));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [, setVersion] = useState(0);
  const bump = () => setVersion((value) => value + 1);

  const value = useMemo<CartContextValue>(
    () => ({
      getCart(slug) {
        return readCart(slug);
      },
      addItem(slug, product, quantity = 1) {
        const cart = readCart(slug);
        const nextQuantity = clampCartQuantity(quantity, product.stock_quantity);
        const existing = cart.find((item) => item.id === product.id);
        const next = existing
          ? cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: clampCartQuantity(item.quantity + nextQuantity, item.stock_quantity ?? product.stock_quantity), stock_quantity: product.stock_quantity }
                : item,
            )
          : [
              ...cart,
              {
                id: product.id,
                name: product.name,
                image_url: product.image_url,
                price: product.price,
                quantity: nextQuantity,
                stock_quantity: product.stock_quantity,
              },
            ];
        writeStorage(cartStorageKey(slug), next);
        bump();
      },
      setQuantity(slug, productId, quantity) {
        const next = readCart(slug).map((item) =>
          item.id === productId ? { ...item, quantity: clampCartQuantity(quantity, item.stock_quantity) } : item,
        );
        writeStorage(cartStorageKey(slug), next);
        bump();
      },
      removeItem(slug, productId) {
        const next = readCart(slug).filter((item) => item.id !== productId);
        writeStorage(cartStorageKey(slug), next);
        bump();
      },
      clearCart(slug) {
        removeStorage(cartStorageKey(slug));
        bump();
      },
      itemCount(slug) {
        return readCart(slug).reduce((sum, item) => sum + item.quantity, 0);
      },
      totalAmount(slug) {
        return readCart(slug).reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    [],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartStore() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartStore must be used inside CartProvider');
  return context;
}

export function useSlugCart(slug: string) {
  const cart = useCartStore();
  return {
    items: cart.getCart(slug),
    addItem: (product: Product, quantity?: number) => cart.addItem(slug, product, quantity),
    setQuantity: (productId: string, quantity: number) => cart.setQuantity(slug, productId, quantity),
    removeItem: (productId: string) => cart.removeItem(slug, productId),
    clearCart: () => cart.clearCart(slug),
    itemCount: cart.itemCount(slug),
    totalAmount: cart.totalAmount(slug),
  };
}
