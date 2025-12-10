import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

const service = new ProductService();

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.query as { merchantId?: string };
      const products = await service.list(merchantId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await service.getById(id);
      if (!product) {
        const err = new Error('Product not found');
        (err as { status?: number }).status = 404;
        throw err;
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await service.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await service.update(id, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}
