import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { api } from '@/api/api'; // NEW API WRAPPER
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const publicPages = ['Storefront', 'ProductDetail', 'Checkout', 'PaymentSuccess', 'Landing'];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    async function loadData() {
      try {
        const isAuth = await api.auth.isAuthenticated();
        if (isAuth) {
          const userData = await api.auth.me();
          setUser(userData);

          const merchants = await api.Merchant.filter({ created_by: userData.email });
          if (merchants.length > 0) {
            setMerchant(merchants[0]);
          }
        }
      } catch (e) {
        console.log('Not authenticated');
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = () => api.auth.logout();

  if (isPublicPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-xl"></div>
          <div className="h-2 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Products', icon: Package, page: 'Products' },
    { name: 'Orders', icon: ShoppingCart, page: 'Orders' },
    { name: 'Store Settings', icon: Settings, page: 'StoreSettings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: 13 148 136;
          --primary-foreground: 255 255 255;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Seranet
          </span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Seranet</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Merchant Info */}
          {merchant && (
            <div className="px-4 py-4 border-b border-slate-100">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                <p className="text-sm text-slate-500">Your Store</p>
                <p className="font-semibold text-slate-900 truncate">{merchant.business_name}</p>
                <Link
                  to={createPageUrl('Storefront') + `?slug=${merchant.store_url_slug}`}
                  target="_blank"
                  className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-2"
                >
                  View Store <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-teal-600")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-100">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'Merchant'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
