import type { FulfillmentStatus, Order, Prisma, Product } from '@prisma/client';
import { nanoid } from 'nanoid';
import { ValidationError } from '../lib/errors.js';

// Fulfillment state machine — delivery progression only.
// Order.status (payment lifecycle) is NOT touched here.
const FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
};

export function nextFulfillmentStatus(current: FulfillmentStatus): FulfillmentStatus {
  const next = FULFILLMENT_TRANSITIONS[current];
  if (!next) {
    throw new ValidationError(`Cannot advance fulfillment beyond "${current}"`);
  }
  return next;
}

export function validateFulfillmentTransition(from: FulfillmentStatus, to: FulfillmentStatus): void {
  const next = FULFILLMENT_TRANSITIONS[from];
  if (next !== to) {
    throw new ValidationError(`Invalid fulfillment transition: "${from}" → "${to}". Expected "${next ?? '(terminal)'}"`);
  }
}

export function generateOrderNumber() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${suffix}`;
}

export function generatePublicAccessToken() {
  return nanoid(32);
}

type OrderStockItem = {
  productId: string;
  quantity: number;
};

async function decrementProductStock(
  tx: Prisma.TransactionClient,
  item: OrderStockItem,
  errorMessage = 'One or more products do not have enough stock',
) {
  const updated = await tx.product.updateMany({
    where: {
      id: item.productId,
      stockQuantity: { gte: item.quantity },
    },
    data: {
      stockQuantity: {
        decrement: item.quantity,
      },
    },
  });

  if (updated.count === 0) {
    throw new ValidationError(errorMessage);
  }
}

export async function reserveOrderStock(
  tx: Prisma.TransactionClient,
  items: OrderStockItem[],
  errorMessage = 'One or more products do not have enough stock',
) {
  for (const item of items) {
    await decrementProductStock(tx, item, errorMessage);
  }
}

export async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  items: OrderStockItem[],
) {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          increment: item.quantity,
        },
      },
    });
  }
}

export async function transitionOrderToPaid(
  tx: Prisma.TransactionClient,
  order: Order & { stockReserved: boolean; items: Array<{ productId: string; quantity: number }> },
) {
  if (order.status === 'paid' || order.status === 'fulfilled') {
    return order;
  }

  if (!order.stockReserved) {
    await reserveOrderStock(tx, order.items);
  }

  return tx.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      stockReserved: true,
    },
  });
}

export async function cancelPendingOrder(
  tx: Prisma.TransactionClient,
  order: Order & { stockReserved: boolean; items: Array<{ productId: string; quantity: number }> },
) {
  if (order.stockReserved) {
    await releaseOrderStock(tx, order.items);
  }

  return tx.order.update({
    where: { id: order.id },
    data: {
      status: 'cancelled',
      stockReserved: false,
    },
  });
}

export function assertOrderItemsBelongToMerchant(products: Product[], merchantId: string) {
  const invalid = products.some((product) => product.merchantId !== merchantId);
  if (invalid) {
    throw new ValidationError('Cart items must belong to the selected store');
  }
}
