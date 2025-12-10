import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const merchantId = req.query.merchant as string | undefined;
  const products = await prisma.product.findMany({
    where: { merchantId: merchantId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, description, price, stock, imageUrl, isActive, merchantId } = req.body;
  if (req.userId !== merchantId) return res.status(403).json({ message: 'Forbidden' });
  const product = await prisma.product.create({ data: { name, description, price, stock, imageUrl, isActive, merchantId } });
  res.json(product);
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const { name, description, price, stock, imageUrl, isActive } = req.body;
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (existing.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { name, description, price, stock, imageUrl, isActive },
  });
  res.json(product);
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (existing.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
