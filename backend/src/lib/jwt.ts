import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type AuthTokenPayload = {
  userId: string;
};

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}
