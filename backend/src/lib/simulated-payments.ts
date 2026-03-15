import type { Order, Payment, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { cancelPendingOrder, transitionOrderToPaid } from '../utils/order.js';

const SIMULATED_PAYMENT_DELAY_MS = 3_000;
const activeTimers = new Map<string, NodeJS.Timeout>();

type PaymentWithOrder = Payment & {
  order: Order & {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  };
};

function clearTimer(paymentId: string) {
  const timer = activeTimers.get(paymentId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(paymentId);
  }
}

function dueAt(payment: Pick<Payment, 'updatedAt'>) {
  return payment.updatedAt.getTime() + SIMULATED_PAYMENT_DELAY_MS;
}

function isTerminalStatus(status: PaymentStatus) {
  return status === 'success' || status === 'failed';
}

async function loadPayment(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      },
    },
  }) as Promise<PaymentWithOrder | null>;
}

async function markPaymentFailed(tx: Prisma.TransactionClient, payment: PaymentWithOrder, reason: string) {
  if (payment.order.status === 'pending') {
    await cancelPendingOrder(tx, payment.order);
  }

  return tx.payment.update({
    where: { id: payment.id },
    data: {
      status: 'failed',
      callbackPayload: JSON.stringify({
        status: 'failed',
        provider: 'telebirr-simulated',
        reason,
      }),
    },
  });
}

export function scheduleSimulatedPaymentCompletion(payment: Pick<Payment, 'id' | 'status' | 'updatedAt'>) {
  clearTimer(payment.id);

  if (isTerminalStatus(payment.status)) {
    return;
  }

  const delay = Math.max(0, dueAt(payment) - Date.now());
  const timer = setTimeout(() => {
    activeTimers.delete(payment.id);
    void reconcileSimulatedPayment(payment.id);
  }, delay);

  activeTimers.set(payment.id, timer);
}

export async function reconcileSimulatedPayment(paymentId: string) {
  const payment = await loadPayment(paymentId);
  if (!payment) {
    clearTimer(paymentId);
    return null;
  }

  if (isTerminalStatus(payment.status)) {
    clearTimer(payment.id);
    return payment;
  }

  if (dueAt(payment) > Date.now()) {
    scheduleSimulatedPaymentCompletion(payment);
    return payment;
  }

  clearTimer(payment.id);

  return prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({
      where: { id: payment.id },
      include: {
        order: {
          include: {
            items: {
              select: {
                productId: true,
                quantity: true,
              },
            },
          },
        },
      },
    }) as PaymentWithOrder | null;

    if (!current) {
      return null;
    }

    if (isTerminalStatus(current.status)) {
      return current;
    }

    if (dueAt(current) > Date.now()) {
      return current;
    }

    try {
      await transitionOrderToPaid(tx, current.order);
      return tx.payment.update({
        where: { id: current.id },
        data: {
          status: 'success',
          telebirrTxnId: current.telebirrTxnId ?? `TB-${Date.now()}`,
          callbackPayload: JSON.stringify({
            status: 'success',
            provider: 'telebirr-simulated',
          }),
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Payment simulation failed';
      return markPaymentFailed(tx, current, reason);
    }
  });
}

export async function reconcileSimulatedPaymentForOrder(orderId: string) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    select: { id: true },
  });

  if (!payment) {
    return null;
  }

  return reconcileSimulatedPayment(payment.id);
}

export async function reconcileSimulatedPaymentsForMerchant(merchantId: string) {
  const payments = await prisma.payment.findMany({
    where: {
      merchantId,
      status: {
        in: ['initiated', 'pending'],
      },
    },
    select: { id: true },
  });

  await Promise.all(payments.map((payment) => reconcileSimulatedPayment(payment.id)));
}

export async function bootstrapSimulatedPayments() {
  const payments = await prisma.payment.findMany({
    where: {
      status: {
        in: ['initiated', 'pending'],
      },
    },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  payments.forEach(scheduleSimulatedPaymentCompletion);
}

export { SIMULATED_PAYMENT_DELAY_MS };
