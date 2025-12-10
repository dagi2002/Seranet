import { prisma } from './prisma';

export class PaymentService {
  async demoPayment(orderId: string, amount: number, customerPhone?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { name: true, image_url: true } } } },
        payment: true,
      },
    });

    if (!order) {
      const error = new Error('Order not found');
      (error as { status?: number }).status = 404;
      throw error;
    }

    if (amount && Math.abs(order.total_amount - amount) > 0) {
      const error = new Error('Payment amount mismatch');
      (error as { status?: number }).status = 400;
      throw error;
    }

    const payment = await prisma.payment.upsert({
      where: { order_id: orderId },
      update: {
        amount,
        status: 'success',
        telebirr_txn_id: `DEMO-${Math.floor(Math.random() * 1000000)}`,
      },
      create: {
        order_id: orderId,
        amount,
        status: 'success',
        telebirr_txn_id: `DEMO-${Math.floor(Math.random() * 1000000)}`,
      },
    });

    await prisma.order.update({ where: { id: orderId }, data: { order_status: 'paid' } });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { name: true, image_url: true } } } },
        payment: true,
      },
    });

    return {
      order: updatedOrder!,
      amount: payment.amount,
      customerPhone,
      message: 'Demo payment processed',
    };
  }
}
