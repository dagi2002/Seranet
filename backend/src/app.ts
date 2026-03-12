import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import merchantRoutes from './routes/merchant';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/uploads')));

app.use('/auth', authRoutes);
app.use('/merchant', merchantRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/upload', uploadRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;
  if (error.message === 'Only image uploads are allowed') {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
};

app.use(errorHandler);

export default app;
