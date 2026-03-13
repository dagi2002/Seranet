import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth';
import merchantRoutes from './routes/merchant';
import storefrontRoutes from './routes/storefront';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/error-handler';

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

app.use(errorHandler);

export default app;
