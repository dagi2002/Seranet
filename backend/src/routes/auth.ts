import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { serializeMerchant } from '../utils/merchant';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, businessName, ownerName, phone, storeSlug } = req.body;
  const existing = await prisma.merchant.findFirst({
    where: {
      OR: [{ email }, { storeSlug }],
    },
  });
  if (existing) {
    const message = existing.email === email ? 'Email already registered' : 'Store slug already registered';
    return res.status(400).json({ message });
  }

  if (!email || !password || !businessName || !ownerName || !phone || !storeSlug) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const merchant = await prisma.merchant.create({
    data: { email, passwordHash, businessName, ownerName, phone, storeSlug },
  });
  const token = jwt.sign({ userId: merchant.id }, process.env.JWT_SECRET || 'seranet-secret', { expiresIn: '7d' });
  return res.json({ token, merchant: serializeMerchant(merchant) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, merchant.passwordHash);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ userId: merchant.id }, process.env.JWT_SECRET || 'seranet-secret', { expiresIn: '7d' });
  return res.json({ token, merchant: serializeMerchant(merchant) });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({ where: { id: req.userId } });
  if (!merchant) return res.status(404).json({ message: 'Not found' });
  return res.json(serializeMerchant(merchant));
});

export default router;
