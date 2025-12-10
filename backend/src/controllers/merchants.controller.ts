import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';

const service = new MerchantService();

export class MerchantController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.query as { slug?: string };
      const merchants = await service.list(slug);
      res.json(merchants);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const merchant = await service.create(name);
      res.status(201).json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const merchant = await service.update(id, req.body);
      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }
}
