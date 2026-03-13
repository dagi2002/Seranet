import { z } from 'zod';

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'Enter the customer name'),
  customer_phone: z.string().trim().min(7, 'Enter a phone number'),
  customer_address: z.string().trim().min(4, 'Enter a delivery address'),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
