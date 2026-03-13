ALTER TABLE "Product"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product"
SET "imageUrls" = CASE
  WHEN "imageUrl" IS NULL OR btrim("imageUrl") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY["imageUrl"]
END;

ALTER TABLE "Product"
DROP COLUMN "imageUrl";
