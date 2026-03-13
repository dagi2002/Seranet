import type {
  Merchant,
  Order,
  OrderItem,
  Payment,
  Product,
  ProductCategory,
  User,
  UserRole,
} from '@prisma/client';

type MerchantWithUser = Merchant & {
  user?: Pick<User, 'email'> | null;
};

type OrderWithItems = Order & {
  items?: OrderItem[];
};

const asCategory = (value: ProductCategory) => value;
const asRole = (value: UserRole) => value;

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: asRole(user.role),
  };
}

export function serializeMerchant(merchant: MerchantWithUser) {
  return {
    id: merchant.id,
    created_date: merchant.createdAt.toISOString(),
    updated_date: merchant.updatedAt.toISOString(),
    created_by: merchant.user?.email ?? '',
    business_name: merchant.businessName,
    owner_name: merchant.ownerName ?? undefined,
    phone: merchant.phone ?? undefined,
    store_url_slug: merchant.storeSlug,
    description: merchant.description ?? undefined,
    logo_url: merchant.logoUrl ?? undefined,
    banner_url: merchant.bannerUrl ?? undefined,
    primary_color: merchant.primaryColor,
    is_active: merchant.isActive,
  };
}

export function serializeProduct(product: Product) {
  const primaryImageUrl = product.imageUrls[0];
  return {
    id: product.id,
    created_date: product.createdAt.toISOString(),
    updated_date: product.updatedAt.toISOString(),
    merchant_id: product.merchantId,
    name: product.name,
    description: product.description ?? undefined,
    price: product.price,
    stock_quantity: product.stockQuantity,
    image_url: primaryImageUrl ?? undefined,
    image_urls: product.imageUrls,
    category: asCategory(product.category),
    is_active: product.isActive,
  };
}

export function serializeOrderItem(item: OrderItem) {
  return {
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    price_at_purchase: item.priceAtPurchase,
  };
}

export function serializeOrder(order: OrderWithItems) {
  return {
    id: order.id,
    created_date: order.createdAt.toISOString(),
    updated_date: order.updatedAt.toISOString(),
    merchant_id: order.merchantId,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress ?? undefined,
    items: (order.items ?? []).map(serializeOrderItem),
    total_amount: order.totalAmount,
    status: order.status,
  };
}

export function serializePublicOrder(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    total_amount: order.totalAmount,
    status: order.status,
  };
}

export function serializeOrderCheckout(order: Order) {
  return {
    ...serializePublicOrder(order),
    public_access_token: order.publicAccessToken,
  };
}

export function serializePayment(payment: Payment) {
  return {
    id: payment.id,
    created_date: payment.createdAt.toISOString(),
    order_id: payment.orderId,
    merchant_id: payment.merchantId,
    telebirr_txn_id: payment.telebirrTxnId ?? undefined,
    amount: payment.amount,
    status: payment.status,
    customer_phone: payment.customerPhone ?? undefined,
    callback_payload: payment.callbackPayload ?? undefined,
  };
}

export function serializePublicPayment(payment: Payment) {
  return {
    id: payment.id,
    order_id: payment.orderId,
    telebirr_txn_id: payment.telebirrTxnId ?? undefined,
    amount: payment.amount,
    status: payment.status,
  };
}
