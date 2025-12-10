import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

const service = new OrderService();

export class OrderController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.query as { merchantId?: string };
      const orders = await service.list(merchantId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await service.getById(id);
      if (!order) {
        const err = new Error('Order not found');
        (err as { status?: number }).status = 404;
        throw err;
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await service.create(req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { order_status } = req.body;
      const order = await service.updateStatus(id, order_status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
}
