import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import merchantRouter from './routes/merchants.routes';
import productRouter from './routes/products.routes';
import orderRouter from './routes/orders.routes';
import paymentRouter from './routes/payments.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/merchants', merchantRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/payments', paymentRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
