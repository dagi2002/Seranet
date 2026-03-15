import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../lib/async-handler.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { signAuthToken } from '../lib/jwt.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  optionalPhone,
  optionalTrimmedString,
  optionalUrl,
  requireEmail,
  requireObject,
  requireSlug,
  requireTrimmedString,
} from '../lib/validation.js';
import { serializeMerchant, serializeUser } from '../utils/serializers.js';

const router = Router();

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

router.post('/register', asyncHandler(async (req, res) => {
  const body = requireObject(req.body, 'Request body');
  const merchant = requireObject(body.merchant, 'Merchant');

  const normalizedEmail = normalizeEmail(requireEmail(body.email, 'Email'));
  const normalizedFullName = requireTrimmedString(body.full_name, 'Full name', { minLength: 2, maxLength: 120 });
  const password = requireTrimmedString(body.password, 'Password', { minLength: 8, maxLength: 128 });
  const merchantBusinessName = requireTrimmedString(merchant.business_name, 'Merchant business name', {
    minLength: 2,
    maxLength: 120,
  });
  const merchantStoreSlug = requireSlug(merchant.store_url_slug, 'Store slug');
  const merchantOwnerName = optionalTrimmedString(merchant.owner_name, 'Owner name', { maxLength: 120 });
  const merchantPhone = optionalPhone(merchant.phone, 'Phone');
  const merchantDescription = optionalTrimmedString(merchant.description, 'Description', { maxLength: 600 });
  const merchantLogoUrl = optionalUrl(merchant.logo_url, 'Logo URL');
  const merchantBannerUrl = optionalUrl(merchant.banner_url, 'Banner URL');

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const existingMerchant = await prisma.merchant.findUnique({
    where: { storeSlug: merchantStoreSlug },
  });
  if (existingMerchant) {
    throw new ConflictError('That store URL is already taken');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        fullName: normalizedFullName,
        passwordHash,
      },
    });

    const createdMerchant = await tx.merchant.create({
      data: {
        userId: user.id,
        businessName: merchantBusinessName,
        ownerName: merchantOwnerName,
        phone: merchantPhone,
        storeSlug: merchantStoreSlug,
        description: merchantDescription,
        logoUrl: merchantLogoUrl,
        bannerUrl: merchantBannerUrl,
      },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return { user, merchant: createdMerchant };
  });

  const token = signAuthToken({ userId: created.user.id });
  res.status(201).json({
    token,
    user: serializeUser(created.user),
    merchant: serializeMerchant(created.merchant),
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const body = requireObject(req.body, 'Request body');
  const normalizedEmail = normalizeEmail(requireEmail(body.email, 'Email'));
  const password = requireTrimmedString(body.password, 'Password', { minLength: 8, maxLength: 128 });
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      merchant: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = signAuthToken({ userId: user.id });
  res.json({
    token,
    user: serializeUser(user),
    merchant: user.merchant ? serializeMerchant(user.merchant) : null,
  });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json(serializeUser(user));
}));

export default router;
