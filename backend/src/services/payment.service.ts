import { prisma } from './prisma';

export class PaymentService {
  async demoPayment(orderId: number, amount: number) {
    return prisma.payment.create({
      data: {
        orderId,
        amount,
        status: 'demo_processed',
      },
    });
  }
}