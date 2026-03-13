import { afterEach, describe, expect, it, vi } from 'vitest';

const mockUploadStream = vi.fn();
const mockConfig = vi.fn();

vi.mock('cloudinary', () => ({
  v2: {
    config: mockConfig,
    uploader: {
      upload_stream: mockUploadStream,
    },
  },
}));

describe('cloud upload storage', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    mockConfig.mockReset();
    mockUploadStream.mockReset();
    vi.resetModules();
  });

  it('uploads images to Cloudinary when the provider is cloudinary', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/seranet?schema=public';
    process.env.JWT_SECRET = 'test-secret';
    process.env.UPLOAD_STORAGE_PROVIDER = 'cloudinary';
    process.env.CLOUDINARY_CLOUD_NAME = 'seranet-test';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';
    process.env.CLOUDINARY_UPLOAD_FOLDER = 'seranet-staging';

    mockUploadStream.mockImplementation((_options, callback) => ({
      end: () => callback(null, { secure_url: 'https://res.cloudinary.com/seranet-staging/image/upload/v1/test.png' }),
    }));

    const { persistUploadedImage } = await import('../lib/uploads.js');

    const fileUrl = await persistUploadedImage({
      buffer: Buffer.from('fake-png'),
      mimetype: 'image/png',
      originalname: 'logo.png',
    } as Express.Multer.File);

    expect(mockConfig).toHaveBeenCalledWith({
      cloud_name: 'seranet-test',
      api_key: 'key',
      api_secret: 'secret',
      secure: true,
    });
    expect(mockUploadStream).toHaveBeenCalledOnce();
    expect(fileUrl).toBe('https://res.cloudinary.com/seranet-staging/image/upload/v1/test.png');
  });
});
