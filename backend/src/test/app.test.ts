import fs from 'node:fs';
import path from 'node:path';
import type { Merchant, Order, OrderItem, Payment, Product, User } from '@prisma/client';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import app from '../app';
import { signAuthToken, verifyAuthToken } from '../lib/jwt';
import { optionalUrlArray } from '../lib/validation';
import { generateOrderNumber } from '../utils/order';
import {
  serializeMerchant,
  serializeOrder,
  serializeOrderCheckout,
  serializePayment,
  serializeProduct,
  serializePublicOrder,
  serializePublicPayment,
  serializeUser,
} from '../utils/serializers';

const uploadedFiles = new Set<string>();

afterEach(() => {
  for (const filePath of uploadedFiles) {
    fs.rmSync(filePath, { force: true });
  }
  uploadedFiles.clear();
});

describe('backend utilities', () => {
  it('round-trips JWT auth tokens', () => {
    const token = signAuthToken({ userId: 'user_123' });
    expect(verifyAuthToken(token)).toMatchObject({ userId: 'user_123' });
  });

  it('generates storefront-safe order numbers', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^ORD-[A-Z0-9]{6}$/);
  });

  it('validates product image arrays with 1..5 images', () => {
    expect(
      optionalUrlArray(
        ['/uploads/p-1.png', '/uploads/p-2.png'],
        'Product images',
        { minLength: 1, maxLength: 5 },
      ),
    ).toEqual(['/uploads/p-1.png', '/uploads/p-2.png']);

    expect(() =>
      optionalUrlArray([], 'Product images', { minLength: 1, maxLength: 5 }),
    ).toThrow('Product images must include at least 1 image');

    expect(() =>
      optionalUrlArray(
        [
          '/uploads/p-1.png',
          '/uploads/p-2.png',
          '/uploads/p-3.png',
          '/uploads/p-4.png',
          '/uploads/p-5.png',
          '/uploads/p-6.png',
        ],
        'Product images',
        { minLength: 1, maxLength: 5 },
      ),
    ).toThrow('Product images cannot include more than 5 images');
  });

  it('serializes user, merchant, product, order, and payment into frontend shapes', () => {
    const user = {
      id: 'user_1',
      email: 'merchant@example.com',
      passwordHash: 'hashed',
      fullName: 'Merchant Owner',
      role: 'admin',
      createdAt: new Date('2026-03-12T10:00:00.000Z'),
      updatedAt: new Date('2026-03-12T10:00:00.000Z'),
    } satisfies User;

    const merchant = {
      id: 'merchant_1',
      userId: user.id,
      businessName: 'Selam Styles',
      ownerName: 'Merchant Owner',
      phone: '0911223344',
      storeSlug: 'selam-styles',
      description: 'Curated fashion and gifting.',
      logoUrl: '/uploads/logo.png',
      bannerUrl: '/uploads/banner.png',
      primaryColor: '#0D9488',
      isActive: true,
      createdAt: new Date('2026-03-12T10:00:00.000Z'),
      updatedAt: new Date('2026-03-12T11:00:00.000Z'),
      user: {
        email: user.email,
      },
    } satisfies Merchant & { user: Pick<User, 'email'> };

    const product = {
      id: 'product_1',
      merchantId: merchant.id,
      name: 'Coffee Set',
      description: 'Ceramic coffee set.',
      price: 4200,
      stockQuantity: 8,
      imageUrls: ['/uploads/product.png', '/uploads/product-2.png'],
      category: 'home',
      isActive: true,
      createdAt: new Date('2026-03-12T10:00:00.000Z'),
      updatedAt: new Date('2026-03-12T11:00:00.000Z'),
    } satisfies Product;

    const item = {
      id: 'item_1',
      orderId: 'order_1',
      productId: product.id,
      productName: product.name,
      quantity: 2,
      priceAtPurchase: product.price,
    } satisfies OrderItem;

    const order = {
      id: 'order_1',
      merchantId: merchant.id,
      orderNumber: 'ORD-ABC123',
      publicAccessToken: 'public-token-123',
      customerName: 'Selamawit Tekle',
      customerPhone: '0911887766',
      customerAddress: 'Bole, Addis Ababa',
      totalAmount: 8400,
      status: 'pending',
      stockReserved: true,
      createdAt: new Date('2026-03-12T10:00:00.000Z'),
      updatedAt: new Date('2026-03-12T11:00:00.000Z'),
      items: [item],
    } satisfies Order & { items: OrderItem[] };

    const payment = {
      id: 'payment_1',
      orderId: order.id,
      merchantId: merchant.id,
      provider: 'telebirr',
      status: 'initiated',
      amount: 8400,
      customerPhone: '0911887766',
      telebirrTxnId: null,
      callbackPayload: null,
      createdAt: new Date('2026-03-12T10:00:00.000Z'),
      updatedAt: new Date('2026-03-12T11:00:00.000Z'),
    } satisfies Payment;

    expect(serializeUser(user)).toMatchObject({
      email: 'merchant@example.com',
      full_name: 'Merchant Owner',
      role: 'admin',
    });

    expect(serializeMerchant(merchant)).toMatchObject({
      business_name: 'Selam Styles',
      store_url_slug: 'selam-styles',
      created_by: 'merchant@example.com',
      is_active: true,
    });

    expect(serializeProduct(product)).toMatchObject({
      merchant_id: merchant.id,
      stock_quantity: 8,
      image_url: '/uploads/product.png',
      image_urls: ['/uploads/product.png', '/uploads/product-2.png'],
    });

    expect(serializeOrder(order)).toMatchObject({
      order_number: 'ORD-ABC123',
      customer_name: 'Selamawit Tekle',
      items: [
        {
          product_id: product.id,
          product_name: 'Coffee Set',
          quantity: 2,
          price_at_purchase: 4200,
        },
      ],
    });

    expect(serializePublicOrder(order)).toMatchObject({
      id: order.id,
      order_number: 'ORD-ABC123',
      total_amount: 8400,
      status: 'pending',
    });

    expect(serializeOrderCheckout(order)).toMatchObject({
      public_access_token: 'public-token-123',
    });

    expect(serializePayment(payment)).toMatchObject({
      order_id: order.id,
      amount: 8400,
      status: 'initiated',
      customer_phone: '0911887766',
    });

    expect(serializePublicPayment(payment)).toMatchObject({
      id: payment.id,
      order_id: order.id,
      amount: 8400,
      status: 'initiated',
    });
  });

  it('allows onboarding logo uploads without auth while keeping merchant uploads protected', async () => {
    const onboardingResponse = await request(app)
      .post('/api/uploads/onboarding-logo')
      .attach('image', Buffer.from('fake-png'), {
        filename: 'logo.png',
        contentType: 'image/png',
      });

    expect(onboardingResponse.status).toBe(201);
    expect(onboardingResponse.body.file_url).toMatch(/^\/uploads\/.+\.png$/);

    const uploadedFilename = onboardingResponse.body.file_url.split('/').pop();
    uploadedFiles.add(path.join(process.cwd(), 'uploads', uploadedFilename));

    const protectedResponse = await request(app)
      .post('/api/uploads/merchant-logo')
      .attach('image', Buffer.from('fake-png'), {
        filename: 'logo.png',
        contentType: 'image/png',
      });

    expect(protectedResponse.status).toBe(401);
  });

  it('rejects upload requests without a file or with a non-image payload', async () => {
    const missingFileResponse = await request(app)
      .post('/api/uploads/onboarding-logo');

    expect(missingFileResponse.status).toBe(400);
    expect(missingFileResponse.body.message).toBe('No file uploaded');

    const invalidFileResponse = await request(app)
      .post('/api/uploads/onboarding-logo')
      .attach('image', Buffer.from('plain-text'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(invalidFileResponse.status).toBe(400);
    expect(invalidFileResponse.body.message).toBe('Only image uploads are allowed');
  });

  it('rejects malformed JSON payloads with a clear 400 response', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Request body must be valid JSON');
  });

  it('rejects non-object auth payloads before route logic runs', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send([]);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Request body must be an object');
  });

  it('rejects malformed payment initiation payloads before querying state', async () => {
    const response = await request(app)
      .post('/api/payments/telebirr/initiate')
      .send({
        order_id: '',
        customer_phone: {},
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Order id is required');
  });
});
