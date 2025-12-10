import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Store, Package, ShoppingCart, Settings, LogOut, Home } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'products' | 'orders' | 'settings';
}

export function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  const { merchant, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, id: 'dashboard' },
    { name: 'Products', href: '/products', icon: Package, id: 'products' },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, id: 'orders' },
    { name: 'Settings', href: '/settings', icon: Settings, id: 'settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Seranet</span>
              </div>
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{merchant?.business_name}</p>
                <a
                  href={`/store/${merchant?.store_url_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View Store
                </a>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
