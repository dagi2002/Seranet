import { Router, type Request, type Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { imageUpload, toUploadUrl } from '../lib/uploads.js';

const router = Router();

function sendFile(fieldName: 'image') {
  return [
    imageUpload.single(fieldName),
    (req: Request & { file?: Express.Multer.File }, res: Response) => {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      res.status(201).json({ file_url: toUploadUrl(req.file.filename) });
    },
  ];
}

router.post('/onboarding-logo', ...sendFile('image'));

router.use(authenticate);

router.post('/merchant-logo', ...sendFile('image'));
router.post('/merchant-banner', ...sendFile('image'));
router.post('/product-image', ...sendFile('image'));

export default router;
