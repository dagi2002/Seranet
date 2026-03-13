import { Link } from 'react-router-dom';
import { ArrowRight, Package2, PlusCircle, Settings2, ShoppingBag, Store, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentMerchant, useCurrentMerchantOrders, useCurrentMerchantProducts } from '@/hooks/queries';
import { formatCurrency, formatDateTime } from '@/utils';

export default function DashboardPage() {
  const { data: merchant, isLoading: merchantLoading } = useCurrentMerchant();
  const { data: products = [], isLoading: productsLoading } = useCurrentMerchantProducts();
  const { data: orders = [], isLoading: ordersLoading } = useCurrentMerchantOrders();

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
  const lowStockProducts = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 5).slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${merchant.owner_name || merchant.business_name}`}
        description="Track sales, inspect recent orders, and keep the storefront in sync with the public customer flow."
        actions={
          <Button asChild variant="outline">
            <Link to={`/s/${merchant.store_url_slug}`} target="_blank" rel="noreferrer">
              Open storefront
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Today’s Sales', formatCurrency(todaysSales), 'vs local demand pulse'],
          ['Total Orders', String(orders.length), 'across the demo storefront'],
          ['Active Products', String(activeProducts), 'currently visible to shoppers'],
        ].map(([label, value, hint]) => (
          <Card key={label} className="overflow-hidden p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                {productsLoading || ordersLoading ? <Skeleton className="mt-4 h-9 w-24" /> : <p className="mt-4 text-3xl font-extrabold">{value}</p>}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500">{hint}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Quick links</CardTitle>
                <CardDescription>Common merchant actions with the same visual system as the storefront.</CardDescription>
              </div>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 sm:flex">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <QuickLink icon={PlusCircle} title="Add Product" description="Create a new catalog item with pricing, stock, and imagery." to="/dashboard/products" />
            <QuickLink icon={ShoppingBag} title="Manage Orders" description="Review customer details and update the order lifecycle." to="/dashboard/orders" />
            <QuickLink icon={Settings2} title="Store Settings" description="Brand the storefront with logos, color, banner, and active status." to="/dashboard/settings" />
            <QuickLink icon={Package2} title="View Storefront" description="Open the public experience customers browse and checkout through." to={`/s/${merchant.store_url_slug}`} external />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Store health</CardTitle>
            <CardDescription>Monitor visibility and inventory before they become storefront issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Store URL</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">seranet.et/{merchant.store_url_slug}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Low stock alerts</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{lowStockProducts.length ? `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''}` : 'All clear'}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {products.length} listed
                </span>
              </div>
              {lowStockProducts.length ? (
                <div className="mt-4 space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{product.name}</span>
                      <span className="text-sm text-amber-700">{product.stock_quantity} left</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">No low-stock issues in the current mock catalog.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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
                    className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
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

        <Card>
          <CardHeader>
            <CardTitle>Merchant snapshot</CardTitle>
            <CardDescription>A quick public-facing preview of the current store identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
              {merchant.banner_url ? (
                <img className="h-40 w-full object-cover" src={merchant.banner_url} alt={merchant.business_name} />
              ) : (
                <div className="h-40 w-full bg-gradient-to-r from-brand-100 via-white to-emerald-100" />
              )}
            </div>
            <div className="flex items-center gap-4">
              <img className="h-14 w-14 rounded-2xl object-cover shadow-sm" src={merchant.logo_url || merchant.banner_url} alt={merchant.business_name} />
              <div>
                <p className="font-semibold text-slate-900">{merchant.business_name}</p>
                <p className="text-sm text-slate-500">{merchant.description}</p>
              </div>
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
      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
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
