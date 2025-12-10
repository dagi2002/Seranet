import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, businessName, ownerName, phone, storeSlug } = req.body;
  const existing = await prisma.merchant.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const merchant = await prisma.merchant.create({
    data: { email, passwordHash, businessName, ownerName, phone, storeSlug },
  });
  const token = jwt.sign({ userId: merchant.id }, process.env.JWT_SECRET || 'seranet-secret', { expiresIn: '7d' });
  return res.json({ token, merchant });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, merchant.passwordHash);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ userId: merchant.id }, process.env.JWT_SECRET || 'seranet-secret', { expiresIn: '7d' });
  return res.json({ token, merchant });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { id: req.userId } });
  if (!merchant) return res.status(404).json({ message: 'Not found' });
  return res.json(merchant);
});

export default router;
