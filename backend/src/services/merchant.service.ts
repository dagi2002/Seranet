import { prisma } from './prisma';

export class MerchantService {
  list() {
    return prisma.merchant.findMany();
  }

  create(name: string) {
    return prisma.merchant.create({ data: { name } });
  }
}