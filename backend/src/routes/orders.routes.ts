import { Router } from 'express';
import { OrderController } from '../controllers/orders.controller';

const router = Router();
const controller = new OrderController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));

export default router;