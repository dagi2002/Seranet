import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const TOKEN_EXPIRATION = '1h';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 50);
}

async function generateUniqueSlug(base: string) {
  let attempt = slugify(base) || 'store';
  let suffix = 0;

  while (true) {
    const slug = suffix ? `${attempt}-${suffix}` : attempt;
    const existing = await prisma.merchant.findUnique({ where: { store_url_slug: slug } });
    if (!existing) {
      return slug;
    }
    suffix += 1;
  }
}

function sanitizeMerchant<T extends { password_hash?: string }>(merchant: T) {
  const { password_hash, ...rest } = merchant;
  return rest;
}

export class AuthService {
  private generateToken(id: string, email: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing JWT secret');
    }

    return jwt.sign({ sub: id, email }, secret, { expiresIn: TOKEN_EXPIRATION });
  }

  async register(email: string, password: string) {
    const existingMerchant = await prisma.merchant.findUnique({ where: { email } });
    if (existingMerchant) {
      const error = new Error('User already exists');
      (error as { status?: number }).status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const businessName = email.split('@')[0] || 'New Merchant';
    const slug = await generateUniqueSlug(businessName);

    const merchant = await prisma.merchant.create({
      data: {
        email,
        password_hash: hashedPassword,
        business_name: businessName,
        store_url_slug: slug,
      },
    });

    const token = this.generateToken(merchant.id, merchant.email);
    return {
      token,
      user: { id: merchant.id, email: merchant.email },
      merchant: sanitizeMerchant(merchant),
    };
  }

  async login(email: string, password: string) {
    const merchant = await prisma.merchant.findUnique({ where: { email } });
    if (!merchant) {
      const error = new Error('Invalid credentials');
      (error as { status?: number }).status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, merchant.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      (error as { status?: number }).status = 401;
      throw error;
    }

    const token = this.generateToken(merchant.id, merchant.email);
    return {
      token,
      user: { id: merchant.id, email: merchant.email },
      merchant: sanitizeMerchant(merchant),
    };
  }
}
