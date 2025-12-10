import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.post('/demo/initiate', async (req, res) => {
  const { orderId, amount } = req.body as { orderId: string; amount: number };
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: { status: 'pending', amount, payload: { step: 'initiate' } },
    create: {
      orderId,
      merchantId: order.merchantId,
      status: 'pending',
      amount,
      payload: { step: 'initiate' },
    },
  });

  setTimeout(async () => {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'success', payload: { step: 'demo-complete' } } });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
  }, 3000);

  return res.json({ status: 'pending', paymentId: payment.id });
});

router.post('/demo/confirm', async (req, res) => {
  const { orderId } = req.body as { orderId: string };
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'success', payload: { step: 'manual-confirm' } } });
  await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
  return res.json({ status: 'success' });
});

export default router;
