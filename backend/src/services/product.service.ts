import { prisma } from './prisma';

export type ProductInput = {
  merchant_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  image_url?: string | null;
  is_active?: boolean;
};

export class ProductService {
  list(merchantId?: string) {
    return prisma.product.findMany({
      where: merchantId ? { merchant_id: merchantId } : undefined,
      orderBy: { created_at: 'desc' },
    });
  }

  getById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  create(data: ProductInput) {
    return prisma.product.create({
      data: {
        merchant_id: data.merchant_id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity ?? 0,
        image_url: data.image_url,
        is_active: data.is_active ?? true,
      },
    });
  }

  update(id: string, data: Partial<ProductInput>) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity,
        image_url: data.image_url,
        is_active: data.is_active,
      },
    });
  }

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
