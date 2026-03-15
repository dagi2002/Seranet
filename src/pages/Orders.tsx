import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { FulfillmentBadge, StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentMerchantOrders } from '@/hooks/queries';
import type { OrderStatus } from '@/types/seranet';
import { formatCurrency, formatDateTime } from '@/utils';

const orderTabs: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const { data: orders = [], isLoading } = useCurrentMerchantOrders();

  const filteredOrders = useMemo(
    () => orders.filter((order) => (activeTab === 'all' ? true : order.status === activeTab)),
    [activeTab, orders],
  );
  const paidOrders = orders.filter((order) => order.status === 'paid' || order.status === 'fulfilled').length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Review incoming orders, filter by status, and jump into the details to update fulfillment."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <OrderMetric label="Total orders" value={String(orders.length)} />
        <OrderMetric label="Pending review" value={String(pendingOrders)} />
        <OrderMetric label="Paid or fulfilled" value={String(paidOrders)} />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | OrderStatus)}>
        <TabsList>
          {orderTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs">{tab.value === 'all' ? orders.length : orders.filter((order) => order.status === tab.value).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredOrders.length ? (
          <div className="divide-y divide-slate-200">
            <div className="hidden bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:grid md:grid-cols-[1.1fr_0.8fr_0.5fr_0.5fr_0.5fr]">
              <span>Order</span>
              <span>Placed</span>
              <span>Amount</span>
              <span className="text-right">Payment</span>
              <span className="text-right">Fulfillment</span>
            </div>
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                className="grid w-full gap-4 p-5 text-left transition hover:bg-slate-50 md:grid-cols-[1.1fr_0.8fr_0.5fr_0.5fr_0.5fr] md:items-center"
                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
              >
                <div>
                  <p className="font-semibold text-slate-900">{order.order_number}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.customer_name}</p>
                </div>
                <p className="text-sm text-slate-500">{formatDateTime(order.created_date)}</p>
                <p className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</p>
                <div className="flex md:justify-end">
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex md:justify-end">
                  <FulfillmentBadge status={order.fulfillment_status} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState icon={ClipboardList} title="No orders in this view" description="New storefront checkouts will appear here with their status and payment records." />
          </div>
        )}
      </Card>
    </div>
  );
}

function OrderMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}
