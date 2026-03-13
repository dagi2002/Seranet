import { Router } from 'express';
import type { OrderStatus, ProductCategory } from '@prisma/client';
import { asyncHandler } from '../lib/async-handler';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth';
import { reconcileSimulatedPaymentForOrder, reconcileSimulatedPaymentsForMerchant } from '../lib/simulated-payments';
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
} from '../lib/validation';
import { serializeMerchant, serializeOrder, serializePayment, serializeProduct } from '../utils/serializers';
import { cancelPendingOrder, transitionOrderToPaid } from '../utils/order';

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
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  res.json(serializeMerchant(updated));
}));

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

router.patch('/me/orders/:orderId', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const merchantId = req.auth?.merchantId;
  const orderId = requireIdParam(req, 'orderId', 'Order id');
  const body = requireObject(req.body, 'Request body');
  const status = requireEnum(body.status, 'Status', ['pending', 'paid', 'cancelled', 'fulfilled'] satisfies OrderStatus[]);
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
    if (status === 'paid') {
      const paidOrder = await transitionOrderToPaid(tx, order);
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'success',
            telebirrTxnId: order.payment.telebirrTxnId ?? `TB-${Date.now()}`,
            callbackPayload: order.payment.callbackPayload ?? '{"status":"success","provider":"telebirr-simulated"}',
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: paidOrder.id },
        include: { items: true },
      });
    }

    if (status === 'cancelled' && order.status === 'pending') {
      const cancelledOrder = await cancelPendingOrder(tx, order);

      if (order.payment && order.payment.status !== 'success') {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: 'failed',
            callbackPayload:
              order.payment.callbackPayload ?? '{"status":"failed","provider":"telebirr-simulated","reason":"merchant-cancelled"}',
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: cancelledOrder.id },
        include: { items: true },
      });
    }

    if (status === 'pending' && order.status !== 'pending') {
      throw new ValidationError('Only pending orders can stay pending');
    }

    return tx.order.update({
      where: { id: order.id },
      data: { status },
      include: { items: true },
    });
  });

  res.json(serializeOrder(updated));
}));

export default router;
