import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

const service = new ProductService();

export class ProductController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await service.list();
      res.json({ products });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, merchantId } = req.body;
      const product = await service.create({ name, description, price, merchantId });
      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  }
}