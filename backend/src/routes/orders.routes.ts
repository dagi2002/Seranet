import { Router } from 'express';
import { OrderController } from '../controllers/orders.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new OrderController();

router.get('/', authMiddleware, (req, res, next) => controller.list(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id', authMiddleware, (req, res, next) => controller.updateStatus(req, res, next));

export default router;
