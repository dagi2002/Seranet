import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env.js';
import { asyncHandler } from './lib/async-handler.js';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import merchantRoutes from './routes/merchant.js';
import storefrontRoutes from './routes/storefront.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready', asyncHandler(async (_req, res) => {
  await prisma.$queryRawUnsafe('SELECT 1');
  res.json({ status: 'ok' });
}));

app.use(errorHandler);

export default app;
