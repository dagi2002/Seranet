import { prisma } from './prisma';

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export class OrderService {
  list() {
    return prisma.order.findMany({ include: { orderItems: true, merchant: true } });
  }

  async create(merchantId: number, items: OrderItemInput[]) {
    return prisma.order.create({
      data: {
        merchantId,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });
  }
}
