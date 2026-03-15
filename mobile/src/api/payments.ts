import type { Payment } from '../types/api';
import { apiRequest } from './client';

export const paymentsApi = {
  initiateTelebirr(orderId: string, customerPhone?: string) {
    return apiRequest<Payment>('/payments/telebirr/initiate', {
      method: 'POST',
      body: {
        order_id: orderId,
        customer_phone: customerPhone,
      },
    });
  },
};
