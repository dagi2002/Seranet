import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyAuthToken } from '../lib/jwt';

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    merchantId: string | null;
  };
};

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }

  try {
    const token = header.slice('Bearer '.length);
    const { userId } = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.auth = {
      userId: user.id,
      merchantId: user.merchant?.id ?? null,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
