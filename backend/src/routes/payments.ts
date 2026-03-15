import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { reconcileSimulatedPayment, scheduleSimulatedPaymentCompletion } from '../lib/simulated-payments.js';
import { optionalPhone, requireEnum, requireIdParam, requireObject, requireTrimmedString } from '../lib/validation.js';
import { transitionOrderToPaid } from '../utils/order.js';
import { serializePayment } from '../utils/serializers.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ──────────────────────────────────────────────
// Telebirr (simulated) — existing flow, unchanged
// ──────────────────────────────────────────────

router.post('/telebirr/initiate', asyncHandler(async (req, res) => {
  const body = requireObject(req.body, 'Request body');
  const orderId = requireTrimmedString(body.order_id, 'Order id', { minLength: 3, maxLength: 191 });
  const customerPhone = optionalPhone(body.customer_phone, 'Customer phone');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== 'pending') {
    throw new ValidationError('Only pending orders can start Telebirr simulation');
  }

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      status: 'pending',
      amount: order.totalAmount,
      customerPhone: customerPhone ?? order.customerPhone,
    },
    create: {
      orderId: order.id,
      merchantId: order.merchantId,
      provider: 'telebirr',
      status: 'pending',
      amount: order.totalAmount,
      customerPhone: customerPhone ?? order.customerPhone,
    },
  });

  scheduleSimulatedPaymentCompletion(payment);
  res.status(201).json(serializePayment(payment));
}));

router.post('/telebirr/simulate/:paymentId', asyncHandler(async (req, res) => {
  const payment = await reconcileSimulatedPayment(requireIdParam(req, 'paymentId', 'Payment id'));

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.status !== 'success') {
    const updatedPayment = await prisma.$transaction(async (tx) => {
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
      });

      if (!current) {
        return null;
      }

      if (current.status !== 'success') {
        await transitionOrderToPaid(tx, current.order);
      }

      return tx.payment.update({
        where: { id: current.id },
        data: {
          status: 'success',
          telebirrTxnId: current.telebirrTxnId ?? `TB-${Date.now()}`,
          callbackPayload: '{"status":"success","provider":"telebirr-simulated"}',
        },
      });
    });

    if (!updatedPayment) {
      throw new NotFoundError('Payment not found');
    }

    res.json(serializePayment(updatedPayment));
    return;
  }

  res.json(serializePayment(payment));
}));

// ──────────────────────────────────────────────
// COD / Bank Transfer — initiate
// Customer selects payment method at checkout;
// these create a Payment record in "pending" state.
// ──────────────────────────────────────────────

router.post('/initiate', asyncHandler(async (req, res) => {
  const body = requireObject(req.body, 'Request body');
  const orderId = requireTrimmedString(body.order_id, 'Order id', { minLength: 3, maxLength: 191 });
  const provider = requireEnum(body.payment_method, 'Payment method', [
    'cash_on_delivery',
    'bank_transfer',
  ] as const);
  const customerPhone = optionalPhone(body.customer_phone, 'Customer phone');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.status !== 'pending') {
    throw new ValidationError('Only pending orders can initiate payment');
  }

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {
      provider,
      status: 'pending',
      amount: order.totalAmount,
      customerPhone: customerPhone ?? order.customerPhone,
    },
    create: {
      orderId: order.id,
      merchantId: order.merchantId,
      provider,
      status: 'pending',
      amount: order.totalAmount,
      customerPhone: customerPhone ?? order.customerPhone,
    },
  });

  res.status(201).json(serializePayment(payment));
}));

// ──────────────────────────────────────────────
// Merchant confirmation — COD / Bank Transfer only
// Telebirr payments are confirmed via simulated callback, not manually.
// ──────────────────────────────────────────────

router.post('/confirm/:paymentId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  const paymentId = requireIdParam(req, 'paymentId', 'Payment id');

  const payment = await prisma.payment.findUnique({
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
  });

  if (!payment || payment.merchantId !== merchantId) {
    throw new NotFoundError('Payment not found');
  }

  // Only COD and bank_transfer can be merchant-confirmed
  if (payment.provider === 'telebirr') {
    throw new ValidationError('Telebirr payments cannot be manually confirmed');
  }

  // Reject already-successful or cancelled
  if (payment.status === 'success') {
    throw new ValidationError('Payment is already confirmed');
  }
  if (payment.order.status === 'cancelled') {
    throw new ValidationError('Cannot confirm payment for a cancelled order');
  }

  const updatedPayment = await prisma.$transaction(async (tx) => {
    await transitionOrderToPaid(tx, payment.order);

    return tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'success',
        confirmedByMerchantAt: new Date(),
      },
    });
  });

  res.json(serializePayment(updatedPayment));
}));

export default router;
