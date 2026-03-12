import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { authenticate } from '../middleware/auth';

const uploadDirectory = path.join(process.cwd(), 'backend/uploads');
const allowedImageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, cb) => {
    const ext = allowedImageTypes[file.mimetype];
    cb(null, `${Date.now()}-${nanoid()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes[file.mimetype]) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});
const router = Router();

router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
