import { Link } from 'react-router-dom';
import { ArrowRight, Package2, PlusCircle, Settings2, ShoppingBag, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMerchant, useOrdersByMerchant, useProductsByMerchant } from '@/hooks/queries';
import { formatCurrency, formatDateTime } from '@/utils';

export default function DashboardPage() {
  const { data: merchant, isLoading: merchantLoading } = useCurrentMerchant();
  const { data: products = [], isLoading: productsLoading } = useProductsByMerchant(merchant?.id);
  const { data: orders = [], isLoading: ordersLoading } = useOrdersByMerchant(merchant?.id);

  if (merchantLoading) return <DashboardSkeleton />;

  if (!merchant) {
    return (
      <EmptyState
        icon={Store}
        title="Create your store"
        description="The demo session is active, but this merchant does not have a storefront yet."
        actionLabel="Start onboarding"
        onAction={() => {
          window.location.href = '/onboarding';
        }}
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todaysSales = orders
    .filter((order) => order.status !== 'cancelled' && order.created_date.slice(0, 10) === today)
    .reduce((sum, order) => sum + order.total_amount, 0);
  const activeProducts = products.filter((product) => product.is_active).length;
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${merchant.owner_name || merchant.business_name}`}
        description="Track sales, inspect recent orders, and keep the storefront in sync with the public customer flow."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Today’s Sales', formatCurrency(todaysSales)],
          ['Total Orders', String(orders.length)],
          ['Active Products', String(activeProducts)],
        ].map(([label, value]) => (
          <Card key={label} className="p-6">
            <p className="text-sm text-slate-500">{label}</p>
            {productsLoading || ordersLoading ? <Skeleton className="mt-4 h-9 w-24" /> : <p className="mt-4 text-3xl font-bold">{value}</p>}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <QuickLink icon={PlusCircle} title="Add Product" description="Create a new catalog item with pricing, stock, and imagery." to="/dashboard/products" />
            <QuickLink icon={ShoppingBag} title="Manage Orders" description="Review customer details and update the order lifecycle." to="/dashboard/orders" />
            <QuickLink icon={Settings2} title="Store Settings" description="Brand the storefront with logos, color, banner, and active status." to="/dashboard/settings" />
            <QuickLink icon={Package2} title="View Storefront" description="Open the public experience customers browse and checkout through." to={`/s/${merchant.store_url_slug}`} external />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-slate-500">Latest customer activity across your storefront.</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/dashboard/orders">
                See all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
              ) : recentOrders.length ? (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                    to={`/dashboard/orders/${order.id}`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{order.order_number}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customer_name} · {formatDateTime(order.created_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  title,
  description,
  to,
  external,
}: {
  icon: typeof PlusCircle;
  title: string;
  description: string;
  to: string;
  external?: boolean;
}) {
  return (
    <Link
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
      to={to}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
