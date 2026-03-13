import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Phone, ReceiptText, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMerchantOrder, useCurrentMerchantPayment } from '@/hooks/queries';
import type { OrderStatus } from '@/types/seranet';
import { formatCurrency, formatDateTime } from '@/utils';

export default function OrderDetailPage() {
  const queryClient = useQueryClient();
  const { orderId = '' } = useParams();
  const { data: order, isLoading } = useCurrentMerchantOrder(orderId);
  const { data: payment, isLoading: paymentLoading } = useCurrentMerchantPayment(orderId);

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => apiClient.orders.updateStatus(orderId, status),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['merchant-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-payment', orderId] });
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <PageHeader title={order.order_number} description={`Placed ${formatDateTime(order.created_date)}`} actions={<StatusBadge status={order.status} />} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Customer & items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoTile icon={User} label="Customer" value={order.customer_name} />
              <InfoTile icon={Phone} label="Phone" value={order.customer_phone} />
              <InfoTile icon={MapPin} label="Address" value={order.customer_address || 'Not provided'} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {order.items.map((item) => (
                    <tr key={item.product_id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
                      <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-slate-500">{formatCurrency(item.price_at_purchase)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(item.quantity * item.price_at_purchase)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-medium text-slate-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Items</span>
                <span className="font-medium text-slate-900">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {paymentLoading ? <Skeleton className="h-20 w-full" /> : payment ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Phone</span>
                    <span className="text-slate-900">{payment.customer_phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telebirr ref</span>
                    <span className="text-slate-900">{payment.telebirr_txn_id || 'Pending callback'}</span>
                  </div>
                </>
              ) : <p className="text-slate-500">No payment record found.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Fulfillment controls</p>
                    <p className="text-sm text-slate-500">Advance the order lifecycle without changing the data contract.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
              {order.status === 'pending' ? (
                <>
                  <Button variant="destructive" onClick={() => mutation.mutate('cancelled')} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Cancel Order
                  </Button>
                  <Button variant="primary" onClick={() => mutation.mutate('paid')} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Mark as Paid
                  </Button>
                </>
              ) : null}
              {order.status === 'paid' ? (
                <Button variant="primary" onClick={() => mutation.mutate('fulfilled')} disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Mark as Fulfilled
                </Button>
              ) : null}
              {order.status === 'fulfilled' || order.status === 'cancelled' ? (
                <p className="text-sm text-slate-500">This order has reached a final state.</p>
              ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 font-medium text-slate-900">{value}</p>
    </div>
  );
}
