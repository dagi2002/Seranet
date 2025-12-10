import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const merchantId = (req.query.merchant as string) || req.userId;
  const orders = await prisma.order.findMany({ where: { merchantId }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
});

router.post('/', async (req, res) => {
  const { customerName, customerPhone, customerAddress, items, totalAmount } = req.body as {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: { productId: string; quantity: number; priceAtPurchase: number }[];
    totalAmount: number;
  };
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });
  const firstProduct = await prisma.product.findUnique({ where: { id: items[0].productId } });
  if (!firstProduct) return res.status(400).json({ message: 'Invalid product' });
  const merchantId = firstProduct.merchantId;
  const order = await prisma.order.create({
    data: {
      merchantId,
      customerName,
      customerPhone,
      customerAddress,
      totalAmount,
      status: 'pending',
      items: { createMany: { data: items.map((i) => ({ ...i })) } },
    },
  });
  res.json(order);
});

router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json(updated);
});

export default router;
