import { Router } from 'express';
import { ProductController } from '../controllers/products.controller';

const router = Router();
const controller = new ProductController();

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));

export default router;