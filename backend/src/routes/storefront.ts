import { Router } from 'express';
import type { PaymentProvider } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { reconcileSimulatedPaymentForOrder } from '../lib/simulated-payments.js';
import {
  assertOrderItemsBelongToMerchant,
  generateOrderNumber,
  generatePublicAccessToken,
  reserveOrderStock,
} from '../utils/order.js';
import {
  optionalTrimmedString,
  requireAccessToken,
  requireArray,
  requireEnum,
  requireIdParam,
  requireObject,
  requirePhone,
  requireSlugParam,
  requireTrimmedString,
} from '../lib/validation.js';
import {
  serializeDeliveryZone,
  serializeMerchant,
  serializeOrderCheckout,
  serializeProduct,
  serializePublicOrder,
  serializePublicPayment,
} from '../utils/serializers.js';

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

// ──────────────────────────────────────────────
// Delivery Zones — public, active only
// ──────────────────────────────────────────────

router.get('/:slug/delivery-zones', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  const zones = await prisma.deliveryZone.findMany({
    where: {
      merchantId: merchant.id,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });

  res.json(zones.map(serializeDeliveryZone));
}));

// ──────────────────────────────────────────────
// Checkout — now accepts payment_method, delivery_zone_id, landmark_note
// ──────────────────────────────────────────────

const ALLOWED_PAYMENT_METHODS: PaymentProvider[] = ['telebirr', 'cash_on_delivery', 'bank_transfer'];

router.post('/:slug/orders', asyncHandler(async (req, res) => {
  const merchant = await getStorefront(requireSlugParam(req));
  if (!merchant || !merchant.isActive) {
    throw new NotFoundError('Store not found');
  }

  const body = requireObject(req.body, 'Request body');
  const customerName = requireTrimmedString(body.customer_name, 'Customer name', { minLength: 2, maxLength: 120 });
  const customerPhone = requirePhone(body.customer_phone, 'Customer phone');
  const customerAddress = requireTrimmedString(body.customer_address, 'Customer address', { minLength: 4, maxLength: 240 });
  const landmarkNote = optionalTrimmedString(body.landmark_note, 'Landmark note', { maxLength: 240 });
  const paymentMethod = requireEnum(body.payment_method, 'Payment method', ALLOWED_PAYMENT_METHODS);
  const deliveryZoneId = optionalTrimmedString(body.delivery_zone_id, 'Delivery zone', { maxLength: 191 });
  const bankTransferRef = optionalTrimmedString(body.bank_transfer_ref, 'Bank transfer reference', { maxLength: 120 });

  const items = requireArray(body.items, 'Items');
  if (items.length === 0) {
    throw new ValidationError('Cart cannot be empty');
  }

  // Validate delivery zone if provided
  let deliveryFee = 0;
  if (deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: deliveryZoneId },
    });
    if (!zone || zone.merchantId !== merchant.id || !zone.isActive) {
      throw new ValidationError('Invalid delivery zone');
    }
    deliveryFee = zone.fee;
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

  const productTotal = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
  const totalAmount = productTotal + deliveryFee;

  const created = await prisma.$transaction(async (tx) => {
    await reserveOrderStock(
      tx,
      orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      'One or more products do not have enough stock',
    );

    const order = await tx.order.create({
      data: {
        merchantId: merchant.id,
        orderNumber: generateOrderNumber(),
        publicAccessToken: generatePublicAccessToken(),
        customerName,
        customerPhone,
        customerAddress,
        landmarkNote,
        productTotal,
        deliveryFee,
        totalAmount,
        fulfillmentType: 'delivery',
        deliveryZoneId: deliveryZoneId ?? undefined,
        status: 'pending',
        stockReserved: true,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Create payment record based on method
    await tx.payment.create({
      data: {
        orderId: order.id,
        merchantId: merchant.id,
        provider: paymentMethod,
        status: paymentMethod === 'telebirr' ? 'initiated' : 'pending',
        amount: totalAmount,
        customerPhone,
        bankTransferRef: paymentMethod === 'bank_transfer' ? bankTransferRef : undefined,
      },
    });

    return order;
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
