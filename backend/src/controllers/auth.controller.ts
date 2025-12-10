import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await service.register(email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await service.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
