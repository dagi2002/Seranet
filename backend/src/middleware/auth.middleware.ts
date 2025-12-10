import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  merchantId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  merchantId?: string;
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret not configured' });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.merchantId = payload.merchantId;
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
