import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useMerchantBySlug, useOrder, usePaymentByOrder } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { queryClient } from '@/lib/query-client';
import { wait, formatCurrency } from '@/utils';

export default function PaymentSuccessPage() {
  const { slug = '', orderId = '' } = useParams();
  const { data: merchant } = useMerchantBySlug(slug);
  const { data: order } = useOrder(orderId);
  const { data: payment } = usePaymentByOrder(orderId);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success'>('processing');

  useEffect(() => {
    let active = true;

    const simulate = async () => {
      if (!order || !payment) return;
      if (payment.status === 'success' && order.status === 'paid') {
        setPaymentStatus('success');
        return;
      }

      await wait(3000);
      if (!active) return;

      await apiClient.entities.Order.update(order.id, { status: 'paid' });
      await apiClient.entities.Payment.update(payment.id, {
        status: 'success',
        telebirr_txn_id: payment.telebirr_txn_id || `TB-${Date.now()}`,
        callback_payload: '{"status":"success","provider":"telebirr-demo"}',
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['order', order.id] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['payment', order.id] }),
      ]);

      setPaymentStatus('success');
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.65 },
      });
    };

    void simulate();

    return () => {
      active = false;
    };
  }, [order, payment]);

  if (!merchant || !order) return null;

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <Card className="w-full max-w-xl p-8 text-center">
          {paymentStatus === 'processing' ? (
            <>
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Waiting for Telebirr confirmation...</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This demo simulates the payment callback locally and updates the order status after a short delay.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Payment successful</h1>
              <p className="mt-3 text-sm text-slate-500">Order {order.order_number} has been marked as paid.</p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Merchant</span>
                  <span className="font-medium text-slate-900">{merchant.business_name}</span>
                </div>
              </div>
              <Button asChild className="mt-8 w-full" variant="primary" size="lg">
                <Link to={`/s/${slug}`}>Continue Shopping</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
