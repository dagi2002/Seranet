import { Router } from 'express';
import { MerchantController } from '../controllers/merchants.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new MerchantController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', authMiddleware, (req, res, next) => controller.create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => controller.update(req, res, next));

export default router;
