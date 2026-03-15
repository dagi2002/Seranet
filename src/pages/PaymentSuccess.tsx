import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useMerchantBySlug, useStorefrontOrder, useStorefrontPayment } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, paymentProviderLabel } from '@/utils';

// For COD/bank_transfer, the order is confirmed immediately (no polling needed).
// For telebirr, we poll until the simulated payment completes.
type PageStatus = 'polling' | 'confirmed' | 'paid' | 'failed';

function isManualPayment(provider?: string) {
  return provider === 'cash_on_delivery' || provider === 'bank_transfer';
}

export default function PaymentSuccessPage() {
  const { slug = '', orderId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access') || '';
  const { data: merchant, isError: merchantError } = useMerchantBySlug(slug);
  const [pageStatus, setPageStatus] = useState<PageStatus>('polling');
  const shouldPoll = pageStatus === 'polling';
  const { data: order, isError: orderError } = useStorefrontOrder(slug, orderId, accessToken, {
    refetchInterval: shouldPoll ? 1_000 : false,
  });
  const { data: payment, isError: paymentError } = useStorefrontPayment(slug, orderId, accessToken, {
    refetchInterval: shouldPoll ? 1_000 : false,
  });

  useEffect(() => {
    if (!order || !payment) return;

    // COD / bank transfer: order is placed, payment is pending — that's the expected state.
    // Show "order confirmed" immediately, no need to poll.
    if (isManualPayment(payment.provider) && order.status === 'pending') {
      setPageStatus((current) => {
        if (current !== 'confirmed') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 } });
        }
        return 'confirmed';
      });
      return;
    }

    // Telebirr (or any provider): payment completed
    if (payment.status === 'success' && order.status === 'paid') {
      setPageStatus((current) => {
        if (current !== 'paid') {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 } });
        }
        return 'paid';
      });
      return;
    }

    if (payment.status === 'failed' || order.status === 'cancelled') {
      setPageStatus('failed');
      return;
    }

    setPageStatus('polling');
  }, [order, payment]);

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <Card className="w-full max-w-xl p-8 text-center sm:p-10">
          <h1 className="text-3xl font-bold text-slate-900">Payment session not available</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            This confirmation link is missing its access token. Return to the storefront and restart checkout if you still need to complete the order.
          </p>
          <div className="mt-8">
            <Button asChild className="w-full" variant="primary" size="lg">
              <Link to={`/s/${slug}`}>Back to Store</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (merchantError || orderError || paymentError) {
    return (
      <div className="container-shell py-16">
        <EmptyState icon={ShieldAlert} title="Payment status unavailable" description="We could not verify this payment session right now. Reopen the link in a moment or return to the storefront." />
      </div>
    );
  }

  if (!merchant || !order) return null;

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <Card className="w-full max-w-xl p-8 text-center sm:p-10">
          {pageStatus === 'polling' ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Waiting for payment confirmation...</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Your payment is being processed. Keep this page open and the status will refresh automatically.
              </p>
            </>
          ) : pageStatus === 'failed' ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
                <span className="text-3xl">!</span>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Payment could not be confirmed</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                We could not confirm this payment yet. Return to the storefront and try checkout again.
              </p>
              <div className="mt-8">
                <Button asChild className="w-full" variant="primary" size="lg">
                  <Link to={`/s/${slug}`}>Back to Store</Link>
                </Button>
              </div>
            </>
          ) : pageStatus === 'confirmed' ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Order placed</h1>
              <p className="mt-3 text-sm text-slate-500">
                Order {order.order_number} has been received. {payment?.provider === 'cash_on_delivery'
                  ? 'Pay cash when your order is delivered.'
                  : 'The merchant will confirm your bank transfer shortly.'}
              </p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Merchant</span>
                  <span className="font-medium text-slate-900">{merchant.business_name}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Payment method</span>
                  <span className="font-medium text-slate-900">{paymentProviderLabel(payment?.provider)}</span>
                </div>
                {payment?.provider === 'bank_transfer' && payment.bank_transfer_ref ? (
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-500">Transfer ref</span>
                    <span className="font-mono font-medium text-slate-900">{payment.bank_transfer_ref}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" size="lg">
                  <Link to={`/s/${slug}`}>Back to Store</Link>
                </Button>
                <Button asChild className="w-full" variant="primary" size="lg">
                  <Link to={`/s/${slug}`}>Continue Shopping</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Payment successful</h1>
              <p className="mt-3 text-sm text-slate-500">Order {order.order_number} is confirmed and marked as paid.</p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total amount</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Merchant</span>
                  <span className="font-medium text-slate-900">{merchant.business_name}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Payment method</span>
                  <span className="font-medium text-slate-900">{paymentProviderLabel(payment?.provider)}</span>
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline" size="lg">
                  <Link to={`/s/${slug}`}>Back to Store</Link>
                </Button>
                <Button asChild className="w-full" variant="primary" size="lg">
                  <Link to={`/s/${slug}`}>Continue Shopping</Link>
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
