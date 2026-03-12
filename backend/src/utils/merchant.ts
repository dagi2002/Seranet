import type { Merchant } from '@prisma/client';

export type PublicMerchant = Omit<Merchant, 'passwordHash'>;

export const serializeMerchant = (merchant: Merchant): PublicMerchant => {
  const { passwordHash, ...publicMerchant } = merchant;
  void passwordHash;
  return publicMerchant;
};
