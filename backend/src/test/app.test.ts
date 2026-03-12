import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll } from 'vitest';

let app: Express;
let prisma: PrismaClient;
let merchantCounter = 0;

const merchantPayload = {
  password: 'secret123',
  phone: '0911000000',
};

const createMerchantPayload = (overrides: Partial<{
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  phone: string;
  storeSlug: string;
}> = {}) => {
  merchantCounter += 1;

  return {
    email: `merchant-${merchantCounter}@example.com`,
    password: merchantPayload.password,
    businessName: `Merchant ${merchantCounter}`,
    ownerName: `Owner ${merchantCounter}`,
    phone: merchantPayload.phone,
    storeSlug: `merchant-${merchantCounter}`,
    ...overrides,
  };
};

const registerMerchant = async (overrides: Partial<ReturnType<typeof createMerchantPayload>> = {}) => {
  const payload = createMerchantPayload(overrides);
  const response = await request(app).post('/auth/register').send(payload);
  if (response.status !== 200) {
    throw new Error(`Failed to register merchant: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return { payload, response };
};

describe('backend stabilization', () => {
  beforeAll(async () => {
    ({ default: app } = await import('../app'));
    ({ prisma } = await import('../prisma'));
  });

  it('sanitizes merchant responses for register, login, and me', async () => {
    const { payload, response: registerResponse } = await registerMerchant();

    expect(registerResponse.status).toBe(200);
    expect(registerResponse.body.merchant.passwordHash).toBeUndefined();

    const loginResponse = await request(app).post('/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.merchant.passwordHash).toBeUndefined();

    const meResponse = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.passwordHash).toBeUndefined();
  });

  it('sanitizes public merchant lookups', async () => {
    const { payload, response } = await registerMerchant();
    const merchantId = response.body.merchant.id as string;

    const byId = await request(app).get(`/merchant/${merchantId}`);
    const bySlug = await request(app).get(`/merchant/slug/${payload.storeSlug}`);

    expect(byId.status).toBe(200);
    expect(bySlug.status).toBe(200);
    expect(byId.body.passwordHash).toBeUndefined();
    expect(bySlug.body.passwordHash).toBeUndefined();
  });

  it('only returns orders for the authenticated merchant', async () => {
    const firstMerchant = await registerMerchant();
    const secondMerchant = await registerMerchant({ businessName: 'Merchant Beta', ownerName: 'Bob' });

    await prisma.order.create({
      data: {
        merchantId: secondMerchant.response.body.merchant.id,
        customerName: 'Customer',
        customerPhone: '0911222333',
        customerAddress: 'Addis',
        totalAmount: 50,
        status: 'pending',
      },
    });

    const response = await request(app)
      .get(`/orders?merchant=${secondMerchant.response.body.merchant.id}`)
      .set('Authorization', `Bearer ${firstMerchant.response.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  it('computes order totals from current product prices', async () => {
    const merchant = await registerMerchant();
    const product = await prisma.product.create({
      data: {
        merchantId: merchant.response.body.merchant.id,
        name: 'Coffee',
        description: 'Roasted',
        price: 100,
        stock: 5,
        isActive: true,
      },
    });

    const response = await request(app).post('/orders').send({
      customerName: 'Customer',
      customerPhone: '0911222333',
      customerAddress: 'Addis',
      totalAmount: 1,
      items: [
        {
          productId: product.id,
          quantity: 2,
          priceAtPurchase: 1,
        },
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.totalAmount).toBe(200);
    expect(response.body.items[0].priceAtPurchase).toBe(100);
  });

  it('rejects mixed-merchant carts', async () => {
    const firstMerchant = await registerMerchant();
    const secondMerchant = await registerMerchant({ businessName: 'Merchant Beta', ownerName: 'Bob' });

    const firstProduct = await prisma.product.create({
      data: {
        merchantId: firstMerchant.response.body.merchant.id,
        name: 'Alpha Product',
        price: 100,
        stock: 4,
        isActive: true,
      },
    });
    const secondProduct = await prisma.product.create({
      data: {
        merchantId: secondMerchant.response.body.merchant.id,
        name: 'Beta Product',
        price: 50,
        stock: 4,
        isActive: true,
      },
    });

    const response = await request(app).post('/orders').send({
      customerName: 'Customer',
      customerPhone: '0911222333',
      customerAddress: 'Addis',
      items: [
        { productId: firstProduct.id, quantity: 1 },
        { productId: secondProduct.id, quantity: 1 },
      ],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('one store');
  });

  it.each([0, -1, 1.5])('rejects invalid quantity %s', async (quantity) => {
    const merchant = await registerMerchant();
    const product = await prisma.product.create({
      data: {
        merchantId: merchant.response.body.merchant.id,
        name: 'Coffee',
        price: 100,
        stock: 5,
        isActive: true,
      },
    });

    const response = await request(app).post('/orders').send({
      customerName: 'Customer',
      customerPhone: '0911222333',
      customerAddress: 'Addis',
      items: [{ productId: product.id, quantity }],
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid items');
  });

  it('only initiates demo payment for valid unpaid orders', async () => {
    const merchant = await registerMerchant();
    const product = await prisma.product.create({
      data: {
        merchantId: merchant.response.body.merchant.id,
        name: 'Coffee',
        price: 75,
        stock: 5,
        isActive: true,
      },
    });
    const order = await prisma.order.create({
      data: {
        merchantId: merchant.response.body.merchant.id,
        customerName: 'Customer',
        customerPhone: '0911222333',
        customerAddress: 'Addis',
        totalAmount: 75,
        status: 'pending',
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            priceAtPurchase: 75,
          },
        },
      },
    });

    const validResponse = await request(app).post('/payments/demo/initiate').send({
      orderId: order.id,
      amount: 75,
    });

    expect(validResponse.status).toBe(200);
    expect(validResponse.body.status).toBe('pending');

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });

    const invalidResponse = await request(app).post('/payments/demo/initiate').send({
      orderId: order.id,
      amount: 75,
    });

    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.message).toContain('not payable');
  });

  it('does not expose the manual demo confirm endpoint', async () => {
    const response = await request(app).post('/payments/demo/confirm').send({ orderId: 'missing' });

    expect(response.status).toBe(404);
  });
});
