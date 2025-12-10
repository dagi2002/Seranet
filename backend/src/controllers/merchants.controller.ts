import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';

const service = new MerchantService();

export class MerchantController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const merchants = await service.list();
      res.json({ merchants });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const merchant = await service.create(name);
      res.status(201).json({ merchant });
    } catch (error) {
      next(error);
    }
  }
}