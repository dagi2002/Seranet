import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

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

export class MerchantService {
  async list(slug?: string) {
    const merchants = await prisma.merchant.findMany({
      where: slug ? { store_url_slug: slug } : undefined,
      orderBy: { created_at: 'desc' },
    });
    return merchants.map((merchant) => sanitizeMerchant(merchant));
  }

  async create(name: string) {
    const businessName = name || 'New Merchant';
    const slug = await generateUniqueSlug(businessName);

    const placeholderPassword = await bcrypt.hash(`pass-${Date.now()}`, 10);
    const merchant = await prisma.merchant.create({
      data: {
        business_name: businessName,
        store_url_slug: slug,
        email: `${slug}@example.com`,
        password_hash: placeholderPassword,
      },
    });

    return sanitizeMerchant(merchant);
  }

  async update(id: string, updates: Partial<{ business_name: string; store_description: string; logo_url: string; primary_color: string; owner_name: string; phone: string }>) {
    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        business_name: updates.business_name,
        store_description: updates.store_description,
        logo_url: updates.logo_url,
        primary_color: updates.primary_color,
        owner_name: updates.owner_name,
        phone: updates.phone,
      },
    });

    return sanitizeMerchant(merchant);
  }
}
