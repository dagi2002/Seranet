import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

const service = new OrderService();

export class OrderController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await service.list();
      res.json({ orders });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, items } = req.body;
      const order = await service.create(merchantId, items);
      res.status(201).json({ order });
    } catch (error) {
      next(error);
    }
  }
}