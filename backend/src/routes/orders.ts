import type { Product } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

type PricedOrderItem = {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
  lineTotal: number;
};

const normalizeQuantity = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
};

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({ where: { merchantId: req.userId }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
});

router.post('/', async (req, res) => {
  const { customerName, customerPhone, customerAddress, items } = req.body as {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: { productId: string; quantity: number }[];
  };
  if (!customerName || !customerPhone || !customerAddress) {
    return res.status(400).json({ message: 'Customer details are required' });
  }
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });

  const normalizedItems = items.map((item) => ({
    productId: item.productId,
    quantity: normalizeQuantity(item.quantity),
  }));

  if (normalizedItems.some((item) => !item.productId || item.quantity === null)) {
    return res.status(400).json({ message: 'Invalid items provided' });
  }

  const validItems = normalizedItems as { productId: string; quantity: number }[];

  const uniqueProductIds = [...new Set(validItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
    },
  });

  if (products.length !== uniqueProductIds.length) {
    return res.status(400).json({ message: 'One or more products are invalid' });
  }

  const merchantIds = new Set(products.map((product) => product.merchantId));
  if (merchantIds.size !== 1) {
    return res.status(400).json({ message: 'Cart items must belong to one store' });
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const pricedItems: PricedOrderItem[] = [];

  for (const item of validItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      return res.status(400).json({ message: 'One or more products are invalid' });
    }
    if (!product.isActive) {
      return res.status(400).json({ message: `${product.name} is no longer available` });
    }
    if (item.quantity > product.stock) {
      return res.status(400).json({ message: `${product.name} does not have enough stock` });
    }

    pricedItems.push({
      product,
      quantity: item.quantity,
      priceAtPurchase: product.price,
      lineTotal: product.price * item.quantity,
    });
  }

  const merchantId = products[0]!.merchantId;
  const totalAmount = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of pricedItems) {
      const updatedProduct = await tx.product.updateMany({
        where: {
          id: item.product.id,
          stock: { gte: item.quantity },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (updatedProduct.count === 0) {
        throw new Error(`${item.product.name} does not have enough stock`);
      }
    }

    return tx.order.create({
      data: {
        merchantId,
        customerName,
        customerPhone,
        customerAddress,
        totalAmount,
        status: 'pending',
        items: {
          createMany: {
            data: pricedItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            })),
          },
        },
      },
      include: {
        items: true,
      },
    });
  }).catch((error: Error) => {
    if (error.message.includes('enough stock')) {
      return { error: error.message };
    }
    throw error;
  });

  if ('error' in order) {
    return res.status(400).json({ message: order.error });
  }

  res.json(order);
});

router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.merchantId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json(updated);
});

export default router;
