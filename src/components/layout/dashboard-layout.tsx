import * as React from 'react';
import { Menu, Package2, Settings, ShoppingBag, Store, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth';
import { useCurrentMerchant } from '@/hooks/queries';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/products', label: 'Products', icon: Package2 },
  { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/dashboard/settings', label: 'Store Settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { data: merchant } = useCurrentMerchant();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-slate-200/80 px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Seranet</p>
          <p className="text-xs text-slate-500">Merchant Console</p>
        </div>
      </div>

      <div className="px-4 py-5">
        <Card className="store-primary-soft border-transparent p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{merchant?.business_name ?? 'Demo Store'}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{merchant?.description ?? 'Customize your storefront and manage orders.'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-slate-900">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          {merchant ? (
            <Link
              className="mt-4 inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-sm font-semibold store-primary-text transition hover:bg-white"
              to={`/s/${merchant.store_url_slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View Store
            </Link>
          ) : null}
        </Card>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900',
                isActive && 'store-primary-soft store-primary-text shadow-sm',
              )
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4">
        <div className="mb-4 rounded-[1.5rem] bg-slate-100/90 p-4">
          <p className="text-sm font-semibold text-slate-900">{user?.email ?? 'merchant@example.com'}</p>
          <p className="text-xs text-slate-500">{merchant?.owner_name || user?.full_name || 'Merchant Account'}</p>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <MerchantThemeStyle color={merchant?.primary_color} />
      <div className="min-h-screen bg-slate-50">
        <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-slate-900">Seranet</span>
          </div>
          {merchant ? (
            <Link className="text-sm font-semibold store-primary-text" to={`/s/${merchant.store_url_slug}`}>
              View Store
            </Link>
          ) : null}
        </header>

        {sidebarOpen ? (
          <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        ) : null}

        <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {sidebar}
        </div>

        <main className="px-4 pb-12 pt-24 lg:ml-72 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </>
  );
}
