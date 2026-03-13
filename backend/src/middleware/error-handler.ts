import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { HttpError } from '../lib/errors.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Request body must be valid JSON' });
    return;
  }

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ message: 'Image upload must be 5 MB or smaller' });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({ message: 'Invalid multipart upload' });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error.message === 'Only image uploads are allowed') {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ message: 'A unique field already exists' });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }

  if (error instanceof Error) {
    console.error(error);
  }

  res.status(500).json({ message: 'Internal server error' });
};
