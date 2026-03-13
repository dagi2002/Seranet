ALTER TABLE "Order"
ADD COLUMN "stockReserved" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Order"
SET "stockReserved" = true
WHERE "status" IN ('paid', 'fulfilled');
