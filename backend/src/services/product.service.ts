import { prisma } from './prisma';

export class ProductService {
  list() {
    return prisma.product.findMany({ include: { merchant: true } });
  }

  create(data: { name: string; description?: string; price: number; merchantId: number }) {
    return prisma.product.create({ data });
  }
}