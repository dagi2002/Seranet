import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler';
import { NotFoundError, ValidationError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { reconcileSimulatedPaymentForOrder } from '../lib/simulated-payments';
import { assertOrderItemsBelongToMerchant, generateOrderNumber, generatePublicAccessToken, reserveOrderStock } from '../utils/order';
import {
  requireAccessToken,
  requireArray,
  requireIdParam,
  requireObject,
  requirePhone,
  requireSlugParam,
  requireTrimmedString,
} from '../lib/validation';
import { serializeMerchant, serializeOrder, serializeOrderCheckout, serializeProduct, serializePublicOrder, serializePublicPayment } from '../utils/serializers';

const router = Router();

function normalizeQuantity(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

async function getStorefront(slug: string) {
  return prisma.merchant.findUnique({
    where: { storeSlug: slug },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
}

router.get('/:slug', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  res.json(serializeMerchant(merchant));
}));

router.get('/:slug/products', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  const products = await prisma.product.findMany({
    where: {
      merchantId: merchant.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(products.map(serializeProduct));
}));

router.get('/:slug/products/:productId', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: requireIdParam(req, 'productId', 'Product id'),
      merchantId: merchant.id,
      isActive: true,
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.json(serializeProduct(product));
}));

router.post('/:slug/orders', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  const body = requireObject(req.body, 'Request body');
  const customerName = requireTrimmedString(body.customer_name, 'Customer name', { minLength: 2, maxLength: 120 });
  const customerPhone = requirePhone(body.customer_phone, 'Customer phone');
  const customerAddress = requireTrimmedString(body.customer_address, 'Customer address', { minLength: 4, maxLength: 240 });
  const items = requireArray(body.items, 'Items');
  if (items.length === 0) {
    throw new ValidationError('Cart cannot be empty');
  }

  const normalizedItems = items.map((item) => ({
    productId: requireTrimmedString(requireObject(item, 'Order item').product_id, 'Product id', { minLength: 3, maxLength: 191 }),
    quantity: normalizeQuantity(requireObject(item, 'Order item').quantity),
  }));

  if (normalizedItems.some((item) => !item.productId || item.quantity === null)) {
    throw new ValidationError('Invalid order items');
  }

  const validItems = normalizedItems as Array<{ productId: string; quantity: number }>;
  const productIds = [...new Set(validItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  if (products.length !== productIds.length) {
    throw new ValidationError('One or more products are invalid');
  }

  assertOrderItemsBelongToMerchant(products, merchant.id);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
  }> = [];

  for (const item of validItems) {
    const product = productMap.get(item.productId)!;
    if (!product.isActive) {
      throw new ValidationError(`${product.name} is no longer available`);
    }
    if (product.stockQuantity < item.quantity) {
      throw new ValidationError(`${product.name} does not have enough stock`);
    }

    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    });
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

  const created = await prisma.$transaction(async (tx) => {
    await reserveOrderStock(
      tx,
      orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      'One or more products do not have enough stock',
    );

    return tx.order.create({
      data: {
        merchantId: merchant.id,
        orderNumber: generateOrderNumber(),
        publicAccessToken: generatePublicAccessToken(),
        customerName,
        customerPhone,
        customerAddress,
        totalAmount,
        status: 'pending',
        stockReserved: true,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });
  });

  res.status(201).json(serializeOrderCheckout(created));
}));

router.get('/:slug/orders/:orderId', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant) {
    throw new NotFoundError('Store not found');
  }

  const orderId = requireIdParam(req, 'orderId', 'Order id');
  const accessToken = requireAccessToken(req);
  await reconcileSimulatedPaymentForOrder(orderId);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      merchantId: merchant.id,
    },
  });

  if (!order || accessToken !== order.publicAccessToken) {
    throw new NotFoundError('Order not found');
  }

  res.json(serializePublicOrder(order));
}));

router.get('/:slug/orders/:orderId/payment', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant) {
    throw new NotFoundError('Store not found');
  }

  const orderId = requireIdParam(req, 'orderId', 'Order id');
  const accessToken = requireAccessToken(req);
  const reconciled = await reconcileSimulatedPaymentForOrder(orderId);
  if (reconciled && reconciled.merchantId !== merchant.id) {
    throw new NotFoundError('Payment not found');
  }

  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      merchantId: merchant.id,
    },
    include: {
      order: {
        select: {
          publicAccessToken: true,
        },
      },
    },
  });

  if (!payment || accessToken !== payment.order.publicAccessToken) {
    throw new NotFoundError('Payment not found');
  }

  res.json(serializePublicPayment(payment));
}));

export default router;
