import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { NotFoundError, ValidationError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { reconcileSimulatedPayment, scheduleSimulatedPaymentCompletion } from '../lib/simulated-payments';
import { optionalPhone, requireIdParam, requireObject, requireTrimmedString } from '../lib/validation';
import { transitionOrderToPaid } from '../utils/order';
import { serializePayment } from '../utils/serializers';

const router = Router();

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

export default router;
