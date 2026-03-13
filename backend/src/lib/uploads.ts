import fs from 'node:fs';
import multer from 'multer';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

const allowedImageTypes: Record<string, string> = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

if (env.uploadStorageProvider === 'local') {
  fs.mkdirSync(env.uploadsDir, { recursive: true });
} else {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

const storage = multer.memoryStorage();

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

export async function persistUploadedImage(file: Express.Multer.File) {
  if (env.uploadStorageProvider === 'cloudinary') {
    const folder = env.cloudinaryUploadFolder.replace(/\/+$/, '');

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error('Cloudinary upload did not return a URL'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    });
  }

  const ext = allowedImageTypes[file.mimetype];
  const filename = `${Date.now()}-${nanoid()}${ext}`;
  const filePath = path.join(env.uploadsDir, filename);
  await fs.promises.writeFile(filePath, file.buffer);
  return toUploadUrl(filename);
}

export function toUploadUrl(filename: string) {
  if (env.uploadsBaseUrl) {
    return `${env.uploadsBaseUrl}/${filename}`;
  }

  return `/uploads/${filename}`;
}
