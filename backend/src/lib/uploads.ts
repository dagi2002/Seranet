import fs from 'node:fs';
import multer from 'multer';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { env } from '../config/env';

const allowedImageTypes: Record<string, string> = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

fs.mkdirSync(env.uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = allowedImageTypes[file.mimetype];
    cb(null, `${Date.now()}-${nanoid()}${ext}`);
  },
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes[file.mimetype]) {
      cb(new Error('Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});

export function toUploadUrl(filename: string) {
  return `/uploads/${filename}`;
}
