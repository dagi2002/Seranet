import { Router } from 'express';
import { PaymentController } from '../controllers/payments.controller';

const router = Router();
const controller = new PaymentController();

router.post('/demo', (req, res, next) => controller.demo(req, res, next));

export default router;