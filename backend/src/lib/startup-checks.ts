import { prisma } from './prisma.js';

type ColumnPresenceRow = {
  has_column: boolean;
};

export async function assertDatabaseSchemaCompatibility() {
  const rows = await prisma.$queryRawUnsafe<ColumnPresenceRow[]>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Product'
        AND column_name = 'imageUrls'
    ) AS has_column
  `);

  if (!rows[0]?.has_column) {
    throw new Error(
      'Database schema is missing Product.imageUrls. Apply the latest Prisma migrations and restart the backend before using multi-image products.',
    );
  }
}
