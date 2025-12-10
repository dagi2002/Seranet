import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:id', async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id } });
  if (!merchant) return res.status(404).json({ message: 'Not found' });
  return res.json(merchant);
});

router.get('/slug/:slug', async (req, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { storeSlug: req.params.slug } });
  if (!merchant) return res.status(404).json({ message: 'Not found' });
  return res.json(merchant);
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  if (req.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const { businessName, ownerName, phone, logoUrl } = req.body;
  const merchant = await prisma.merchant.update({
    where: { id: req.params.id },
    data: { businessName, ownerName, phone, logoUrl },
  });
  return res.json(merchant);
});

export default router;
