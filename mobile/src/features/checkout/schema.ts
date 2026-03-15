import { z } from 'zod';

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'Enter the customer name'),
  customer_phone: z.string().trim().min(7, 'Enter a phone number'),
  customer_address: z.string().trim().min(4, 'Enter a delivery address'),
  payment_method: z.enum(['telebirr', 'cash_on_delivery', 'bank_transfer']),
  delivery_zone_id: z.string().optional(),
  landmark_note: z.string().trim().optional(),
  bank_transfer_ref: z.string().trim().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
