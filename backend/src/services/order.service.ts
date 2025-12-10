import { prisma } from './prisma';

export interface OrderItemInput {
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderInput {
  merchant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  total_amount: number;
  items: OrderItemInput[];
}

const orderIncludes = {
  items: {
    include: {
      product: {
        select: {
          name: true,
          image_url: true,
        },
      },
    },
  },
  payment: true,
};

export class OrderService {
  list(merchantId?: string) {
    return prisma.order.findMany({
      where: merchantId ? { merchant_id: merchantId } : undefined,
      include: orderIncludes,
      orderBy: { created_at: 'desc' },
    });
  }

  getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: orderIncludes,
    });
  }

  create(input: OrderInput) {
    return prisma.order.create({
      data: {
        merchant_id: input.merchant_id,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        customer_address: input.customer_address,
        order_status: 'pending',
        total_amount: input.total_amount,
        items: {
          create: input.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
          })),
        },
      },
      include: orderIncludes,
    });
  }

  updateStatus(id: string, order_status: string) {
    return prisma.order.update({
      where: { id },
      data: { order_status },
      include: orderIncludes,
    });
  }
}
