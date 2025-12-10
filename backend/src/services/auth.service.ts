import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const TOKEN_EXPIRATION = '1h';

export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('User already exists');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword } });
    return this.generateToken(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid credentials');
      (error as Error & { status?: number }).status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      (error as Error & { status?: number }).status = 401;
      throw error;
    }

    return this.generateToken(user.id, user.email);
  }

  private generateToken(id: number, email: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing JWT secret');
    }

    return jwt.sign({ sub: id, email }, secret, { expiresIn: TOKEN_EXPIRATION });
  }
}