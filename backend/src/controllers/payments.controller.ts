import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

const service = new PaymentService();

export class PaymentController {
  async demo(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount, customerPhone } = req.body;
      const paymentResponse = await service.demoPayment(orderId, amount, customerPhone);
      res.status(201).json(paymentResponse);
    } catch (error) {
      next(error);
    }
  }
}
