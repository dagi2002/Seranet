import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

const service = new PaymentService();

export class PaymentController {
  async demo(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount } = req.body;
      const payment = await service.demoPayment(orderId, amount);
      res.status(201).json({ payment });
    } catch (error) {
      next(error);
    }
  }
}