import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { testDatabaseUrl } from './test-db';

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'test-secret';

let prisma: PrismaClient;

beforeAll(async () => {
  ({ prisma } = await import('../prisma'));
});

beforeEach(async () => {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
