-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('delivery', 'pickup');

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'cash_on_delivery';
ALTER TYPE "PaymentProvider" ADD VALUE 'bank_transfer';

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryZone_merchantId_idx" ON "DeliveryZone"("merchantId");

-- AddForeignKey
ALTER TABLE "DeliveryZone" ADD CONSTRAINT "DeliveryZone_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Order - add new columns
ALTER TABLE "Order" ADD COLUMN "landmarkNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "productTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "deliveryFee" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "Order" ADD COLUMN "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'delivery';
ALTER TABLE "Order" ADD COLUMN "deliveryZoneId" TEXT;

-- Backfill productTotal from totalAmount for existing orders
UPDATE "Order" SET "productTotal" = "totalAmount";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Payment - add confirmedByMerchantAt
ALTER TABLE "Payment" ADD COLUMN "confirmedByMerchantAt" TIMESTAMP(3);
