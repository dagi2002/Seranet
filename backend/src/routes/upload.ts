import { Router, type Request, type Response } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { authenticate } from '../middleware/auth.js';
import { imageUpload, persistUploadedImage } from '../lib/uploads.js';

const router = Router();

function sendFile(fieldName: 'image') {
  return [
    imageUpload.single(fieldName),
    asyncHandler(async (req: Request & { file?: Express.Multer.File }, res: Response) => {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const fileUrl = await persistUploadedImage(req.file);
      res.status(201).json({ file_url: fileUrl });
    }),
  ];
}

router.post('/onboarding-logo', ...sendFile('image'));

router.use(authenticate);

router.post('/merchant-logo', ...sendFile('image'));
router.post('/merchant-banner', ...sendFile('image'));
router.post('/product-image', ...sendFile('image'));

export default router;
