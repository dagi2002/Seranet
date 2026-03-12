import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.post('/demo/initiate', async (req, res) => {
  const { orderId, amount } = req.body as { orderId: string; amount: number };
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'pending') {
    return res.status(400).json({ message: 'Order is not payable' });
  }
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount !== order.totalAmount) {
    return res.status(400).json({ message: 'Payment amount mismatch' });
  }

  const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
  if (existingPayment?.status === 'success') {
    return res.status(400).json({ message: 'Order already paid' });
  }

  const payment = await prisma.payment.upsert({
    where: { orderId },
    update: { status: 'pending', amount, payload: JSON.stringify({ step: 'initiate' }) },
    create: {
      orderId,
      merchantId: order.merchantId,
      status: 'pending',
      amount,
      payload: JSON.stringify({ step: 'initiate' }),
    },
  });

  setTimeout(async () => {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success', payload: JSON.stringify({ step: 'demo-complete' }) },
    });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
  }, 3000);

  return res.json({ status: 'pending', paymentId: payment.id });
});

export default router;
