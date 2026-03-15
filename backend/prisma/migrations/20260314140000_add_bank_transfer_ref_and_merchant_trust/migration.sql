-- Payment: add bank transfer reference field
ALTER TABLE "Payment" ADD COLUMN "bankTransferRef" TEXT;

-- Merchant: add trust/verification fields
ALTER TABLE "Merchant" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Merchant" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Merchant" ADD COLUMN "supportPhone" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "storePolicy" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "returnPolicy" TEXT;
