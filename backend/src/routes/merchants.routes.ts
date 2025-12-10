import { Router } from 'express';
import { MerchantController } from '../controllers/merchants.controller';

const router = Router();
const controller = new MerchantController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));

export default router;