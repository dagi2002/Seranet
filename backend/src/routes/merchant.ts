import { Router } from 'express';
import type { FulfillmentStatus, OrderStatus, ProductCategory } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler.js';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { reconcileSimulatedPaymentForOrder, reconcileSimulatedPaymentsForMerchant } from '../lib/simulated-payments.js';
import {
  optionalBoolean,
  optionalEnum,
  optionalHexColor,
  optionalInteger,
  optionalPhone,
  optionalTrimmedString,
  optionalUrlArray,
  optionalUrl,
  requireEnum,
  requireInteger,
  requireIdParam,
  requireObject,
  requireSlug,
  requireTrimmedString,
} from '../lib/validation.js';
import { serializeDeliveryZone, serializeMerchant, serializeOrder, serializePayment, serializeProduct } from '../utils/serializers.js';
import { cancelPendingOrder, transitionOrderToPaid, validateFulfillmentTransition } from '../utils/order.js';

const router = Router();
const MAX_PRODUCT_IMAGES = 5;

router.use(authenticate);

function parseProductImageUrls(
  payload: Record<string, unknown>,
  options: {
    required?: boolean;
  } = {},
) {
  if (typeof payload.image_urls !== 'undefined') {
    return optionalUrlArray(payload.image_urls, 'Product images', {
      minLength: 1,
      maxLength: MAX_PRODUCT_IMAGES,
    });
  }

  if (typeof payload.image_url !== 'undefined') {
    const imageUrl = optionalUrl(payload.image_url, 'Product image');
    if (!imageUrl) {
      throw new ValidationError('Product images must include at least 1 image');
    }

    return [imageUrl];
  }

  if (options.required) {
    throw new ValidationError('Product images must include at least 1 image');
  }

  return undefined;
}

async function getCurrentMerchant(req: AuthenticatedRequest) {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) return null;

  return prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
}

router.get('/me', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchant = await getCurrentMerchant(req);
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  res.json(serializeMerchant(merchant));
}));

router.patch('/me', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchant = await getCurrentMerchant(req);
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const payload = requireObject(req.body, 'Request body');
  const storeSlug = typeof payload.store_url_slug === 'undefined' ? undefined : requireSlug(payload.store_url_slug, 'Store slug');

  if (storeSlug && storeSlug !== merchant.storeSlug) {
    const slugOwner = await prisma.merchant.findUnique({
      where: { storeSlug },
    });
    if (slugOwner) {
      throw new ConflictError('That store URL is already taken');
    }
  }

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      businessName: optionalTrimmedString(payload.business_name, 'Business name', { maxLength: 120 }),
      ownerName: optionalTrimmedString(payload.owner_name, 'Owner name', { maxLength: 120 }),
      phone: optionalPhone(payload.phone, 'Phone'),
      storeSlug,
      description: optionalTrimmedString(payload.description, 'Description', { maxLength: 600 }),
      logoUrl: optionalUrl(payload.logo_url, 'Logo URL'),
      bannerUrl: optionalUrl(payload.banner_url, 'Banner URL'),
      primaryColor: optionalHexColor(payload.primary_color, 'Primary color'),
      isActive: optionalBoolean(payload.is_active, 'Store active flag'),
      supportPhone: optionalPhone(payload.support_phone, 'Support phone'),
      storePolicy: optionalTrimmedString(payload.store_policy, 'Store policy', { maxLength: 2000 }),
      returnPolicy: optionalTrimmedString(payload.return_policy, 'Return policy', { maxLength: 2000 }),
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  res.json(serializeMerchant(updated));
}));

// ──────────────────────────────────────────────
// Delivery Zones — CRUD (no delete, deactivation only)
// ──────────────────────────────────────────────

router.get('/me/delivery-zones', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  const zones = await prisma.deliveryZone.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'asc' },
  });

  res.json(zones.map(serializeDeliveryZone));
}));

router.post('/me/delivery-zones', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  const payload = requireObject(req.body, 'Request body');
  const name = requireTrimmedString(payload.name, 'Zone name', { minLength: 1, maxLength: 120 });
  const fee = requireInteger(payload.fee, 'Delivery fee', { min: 0 });

  const zone = await prisma.deliveryZone.create({
    data: {
      merchantId,
      name,
      fee,
    },
  });

  res.status(201).json(serializeDeliveryZone(zone));
}));

router.patch('/me/delivery-zones/:zoneId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const zoneId = requireIdParam(req, 'zoneId', 'Zone id');

  const zone = await prisma.deliveryZone.findUnique({
    where: { id: zoneId },
  });

  if (!merchantId || !zone || zone.merchantId !== merchantId) {
    throw new NotFoundError('Delivery zone not found');
  }

  const payload = requireObject(req.body, 'Request body');

  const updated = await prisma.deliveryZone.update({
    where: { id: zone.id },
    data: {
      name: optionalTrimmedString(payload.name, 'Zone name', { maxLength: 120 }),
      fee: optionalInteger(payload.fee, 'Delivery fee', { min: 0 }),
      isActive: optionalBoolean(payload.is_active, 'Zone active flag'),
    },
  });

  res.json(serializeDeliveryZone(updated));
}));

// ──────────────────────────────────────────────
// Products
// ──────────────────────────────────────────────

router.get('/me/products', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  const products = await prisma.product.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(products.map(serializeProduct));
}));

router.post('/me/products', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  const payload = requireObject(req.body, 'Request body');
  const name = requireTrimmedString(payload.name, 'Product name', { minLength: 1, maxLength: 160 });
  const price = requireInteger(payload.price, 'Price', { min: 0 });
  const imageUrls = parseProductImageUrls(payload, { required: true });

  const product = await prisma.product.create({
    data: {
      merchantId,
      name,
      description: optionalTrimmedString(payload.description, 'Description', { maxLength: 1000 }),
      price,
      stockQuantity: optionalInteger(payload.stock_quantity, 'Stock quantity', { min: 0 }) ?? 0,
      imageUrls,
      category: optionalEnum(payload.category, 'Category', [
        'clothing',
        'electronics',
        'food',
        'home',
        'beauty',
        'sports',
        'other',
      ] satisfies ProductCategory[]) ?? 'other',
      isActive: optionalBoolean(payload.is_active, 'Product active flag') ?? true,
    },
  });

  res.status(201).json(serializeProduct(product));
}));

router.patch('/me/products/:productId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const productId = requireIdParam(req, 'productId', 'Product id');
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!merchantId || !product || product.merchantId !== merchantId) {
    throw new NotFoundError('Product not found');
  }

  const payload = requireObject(req.body, 'Request body');
  const imageUrls = parseProductImageUrls(payload);

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      name: optionalTrimmedString(payload.name, 'Product name', { maxLength: 160 }),
      description: optionalTrimmedString(payload.description, 'Description', { maxLength: 1000 }),
      price: optionalInteger(payload.price, 'Price', { min: 0 }),
      stockQuantity: optionalInteger(payload.stock_quantity, 'Stock quantity', { min: 0 }),
      imageUrls,
      category: optionalEnum(payload.category, 'Category', [
        'clothing',
        'electronics',
        'food',
        'home',
        'beauty',
        'sports',
        'other',
      ] satisfies ProductCategory[]),
      isActive: optionalBoolean(payload.is_active, 'Product active flag'),
    },
  });

  res.json(serializeProduct(updated));
}));

router.delete('/me/products/:productId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const productId = requireIdParam(req, 'productId', 'Product id');
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!merchantId || !product || product.merchantId !== merchantId) {
    throw new NotFoundError('Product not found');
  }

  await prisma.product.delete({ where: { id: product.id } });
  res.json({ success: true });
}));

// ──────────────────────────────────────────────
// Orders
// ──────────────────────────────────────────────

router.get('/me/orders', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  if (!merchantId) {
    throw new NotFoundError('Merchant not found');
  }

  await reconcileSimulatedPaymentsForMerchant(merchantId);

  const orders = await prisma.order.findMany({
    where: { merchantId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders.map(serializeOrder));
}));

router.get('/me/orders/:orderId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const orderId = requireIdParam(req, 'orderId', 'Order id');
  await reconcileSimulatedPaymentForOrder(orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!merchantId || !order || order.merchantId !== merchantId) {
    throw new NotFoundError('Order not found');
  }

  res.json(serializeOrder(order));
}));

router.get('/me/orders/:orderId/payment', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const orderId = requireIdParam(req, 'orderId', 'Order id');
  await reconcileSimulatedPaymentForOrder(orderId);
  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      merchantId: merchantId ?? undefined,
    },
  });

  if (!merchantId || !payment) {
    throw new NotFoundError('Payment not found');
  }

  res.json(serializePayment(payment));
}));

// Order PATCH — handles both payment status and fulfillment status as separate concerns.
// Body can contain:
//   { status: OrderStatus }             — payment lifecycle transition
//   { fulfillment_status: FulfillmentStatus } — delivery lifecycle transition
// Both can be sent in the same request.
router.patch('/me/orders/:orderId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const orderId = requireIdParam(req, 'orderId', 'Order id');
  const body = requireObject(req.body, 'Request body');

  const status = optionalEnum(body.status, 'Status', ['pending', 'paid', 'cancelled', 'fulfilled'] satisfies OrderStatus[]);
  const fulfillmentStatus = optionalEnum(body.fulfillment_status, 'Fulfillment status', [
    'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered',
  ] satisfies FulfillmentStatus[]);

  if (!status && !fulfillmentStatus) {
    throw new ValidationError('Either status or fulfillment_status is required');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
      payment: true,
    },
  });

  if (!merchantId || !order || order.merchantId !== merchantId) {
    throw new NotFoundError('Order not found');
  }

  const updated = await prisma.$transaction(async (tx) => {
    let currentOrder = order;

    // Handle payment status transition
    if (status) {
      if (status === 'paid') {
        const paidOrder = await transitionOrderToPaid(tx, currentOrder);
        if (currentOrder.payment) {
          const paymentUpdate: Record<string, unknown> = { status: 'success' };
          // Only write Telebirr-specific fields for telebirr payments
          if (currentOrder.payment.provider === 'telebirr') {
            paymentUpdate.telebirrTxnId = currentOrder.payment.telebirrTxnId ?? `TB-${Date.now()}`;
            paymentUpdate.callbackPayload = currentOrder.payment.callbackPayload ?? '{"status":"success","provider":"telebirr-simulated"}';
          } else {
            // For COD/bank_transfer, record merchant confirmation timestamp
            paymentUpdate.confirmedByMerchantAt = new Date();
          }
          await tx.payment.update({
            where: { id: currentOrder.payment.id },
            data: paymentUpdate,
          });
        }
        currentOrder = await tx.order.findUniqueOrThrow({
          where: { id: paidOrder.id },
          include: { items: { select: { productId: true, quantity: true } }, payment: true },
        });
      } else if (status === 'cancelled' && currentOrder.status === 'pending') {
        const cancelledOrder = await cancelPendingOrder(tx, currentOrder);

        if (currentOrder.payment && currentOrder.payment.status !== 'success') {
          await tx.payment.update({
            where: { id: currentOrder.payment.id },
            data: {
              status: 'failed',
              callbackPayload:
                currentOrder.payment.callbackPayload ?? '{"status":"failed","reason":"merchant-cancelled"}',
            },
          });
        }

        currentOrder = await tx.order.findUniqueOrThrow({
          where: { id: cancelledOrder.id },
          include: { items: { select: { productId: true, quantity: true } }, payment: true },
        });
      } else if (status === 'fulfilled') {
        currentOrder = await tx.order.update({
          where: { id: currentOrder.id },
          data: { status: 'fulfilled' },
          include: { items: { select: { productId: true, quantity: true } }, payment: true },
        });
      } else if (status === 'pending' && currentOrder.status !== 'pending') {
        throw new ValidationError('Cannot revert order to pending');
      }
    }

    // Handle fulfillment status transition
    if (fulfillmentStatus) {
      validateFulfillmentTransition(currentOrder.fulfillmentStatus, fulfillmentStatus);

      currentOrder = await tx.order.update({
        where: { id: currentOrder.id },
        data: { fulfillmentStatus },
        include: { items: { select: { productId: true, quantity: true } }, payment: true },
      });
    }

    return tx.order.findUniqueOrThrow({
      where: { id: currentOrder.id },
      include: { items: true },
    });
  });

  res.json(serializeOrder(updated));
}));

export default router;
