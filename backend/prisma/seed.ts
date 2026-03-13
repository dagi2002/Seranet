import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { generatePublicAccessToken } from '../src/utils/order';

const demoEmail = 'demo@seranet.et';
const demoPassword = 'demo12345';

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      fullName: 'Meklit Desta',
      passwordHash,
    },
  });

  const merchant = await prisma.merchant.create({
    data: {
      userId: user.id,
      businessName: 'Addis Market Studio',
      ownerName: 'Meklit Desta',
      phone: '0911223344',
      storeSlug: 'addis-market-studio',
      description:
        'Curated Ethiopian lifestyle goods, everyday essentials, and digital-first customer service for fast local delivery.',
      logoUrl:
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
      primaryColor: '#0D9488',
      isActive: true,
    },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Habesha Coffee Set',
        description: 'Hand-finished ceramic jebena set designed for modern coffee ceremonies.',
        price: 4200,
        stockQuantity: 11,
        imageUrls: [
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'home',
      },
    }),
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Telebirr Green Phone Case',
        description: 'Slim matte phone case with bold emerald finish and soft-touch grip.',
        price: 950,
        stockQuantity: 22,
        imageUrls: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'electronics',
      },
    }),
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Roasted Buna Gift Box',
        description: 'Fresh-roasted Ethiopian coffee beans with tasting notes and gift wrap.',
        price: 1600,
        stockQuantity: 0,
        imageUrls: [
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'food',
      },
    }),
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Addis Woven Scarf',
        description: 'Lightweight cotton scarf with handwoven border detail.',
        price: 1300,
        stockQuantity: 15,
        imageUrls: [
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'clothing',
      },
    }),
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Shea + Tena Adam Soap',
        description: 'Small-batch beauty bar with botanical oils and a clean herbal finish.',
        price: 420,
        stockQuantity: 43,
        imageUrls: [
          'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'beauty',
      },
    }),
    prisma.product.create({
      data: {
        merchantId: merchant.id,
        name: 'Trail Water Bottle',
        description: 'Insulated steel bottle built for long commutes and weekend hikes.',
        price: 1450,
        stockQuantity: 8,
        imageUrls: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80',
        ],
        category: 'sports',
      },
    }),
  ]);

  const pendingOrder = await prisma.order.create({
    data: {
      merchantId: merchant.id,
      orderNumber: 'ORD-PEND123',
      publicAccessToken: generatePublicAccessToken(),
      customerName: 'Selamawit Tekle',
      customerPhone: '0911887766',
      customerAddress: 'Bole, Addis Ababa',
      totalAmount: 4200,
      status: 'pending',
      stockReserved: true,
      items: {
        create: [
          {
            productId: products[0]!.id,
            productName: 'Habesha Coffee Set',
            quantity: 1,
            priceAtPurchase: 4200,
          },
        ],
      },
    },
  });

  const paidOrder = await prisma.order.create({
    data: {
      merchantId: merchant.id,
      orderNumber: 'ORD-PAID456',
      publicAccessToken: generatePublicAccessToken(),
      customerName: 'Abel Girma',
      customerPhone: '0913002200',
      customerAddress: 'CMC, Addis Ababa',
      totalAmount: 3160,
      status: 'paid',
      stockReserved: true,
      items: {
        create: [
          {
            productId: products[1]!.id,
            productName: 'Telebirr Green Phone Case',
            quantity: 2,
            priceAtPurchase: 950,
          },
          {
            productId: products[4]!.id,
            productName: 'Shea + Tena Adam Soap',
            quantity: 3,
            priceAtPurchase: 420,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      merchantId: merchant.id,
      orderNumber: 'ORD-FULL789',
      publicAccessToken: generatePublicAccessToken(),
      customerName: 'Rahel Endale',
      customerPhone: '0914557788',
      customerAddress: 'Piassa, Addis Ababa',
      totalAmount: 2600,
      status: 'fulfilled',
      stockReserved: true,
      items: {
        create: [
          {
            productId: products[3]!.id,
            productName: 'Addis Woven Scarf',
            quantity: 2,
            priceAtPurchase: 1300,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      merchantId: merchant.id,
      orderNumber: 'ORD-CANC246',
      publicAccessToken: generatePublicAccessToken(),
      customerName: 'Meron Hailu',
      customerPhone: '0919331100',
      customerAddress: 'Kazanchis, Addis Ababa',
      totalAmount: 1450,
      status: 'cancelled',
      stockReserved: false,
      items: {
        create: [
          {
            productId: products[5]!.id,
            productName: 'Trail Water Bottle',
            quantity: 1,
            priceAtPurchase: 1450,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: pendingOrder.id,
      merchantId: merchant.id,
      provider: 'telebirr',
      amount: 4200,
      status: 'pending',
      customerPhone: '0911887766',
    },
  });

  await prisma.payment.create({
    data: {
      orderId: paidOrder.id,
      merchantId: merchant.id,
      provider: 'telebirr',
      amount: 3160,
      status: 'success',
      customerPhone: '0913002200',
      telebirrTxnId: 'TB-DEMO-222',
      callbackPayload: '{"status":"success"}',
    },
  });

  console.log(`Seeded demo merchant ${demoEmail} with password ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
