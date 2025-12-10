import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

interface Stats {
  todaySales: number;
  totalOrders: number;
  activeProducts: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  order_status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
}

export function Dashboard() {
  const { merchant } = useAuth();
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (merchant) {
      loadDashboardData();
    }
  }, [merchant]);

  const loadDashboardData = async () => {
    if (!merchant) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersRes, productsRes, recentOrdersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, created_at, order_status')
        .eq('merchant_id', merchant.id),
      supabase
        .from('products')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true),
      supabase
        .from('orders')
        .select('id, order_status, total_amount, created_at, customer_name')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (ordersRes.data) {
      const todaySales = ordersRes.data
        .filter((o) => new Date(o.created_at) >= today && o.order_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const pendingCount = ordersRes.data.filter((o) => o.order_status === 'pending').length;

      setStats({
        todaySales,
        totalOrders: ordersRes.data.length,
        activeProducts: productsRes.data?.length || 0,
        pendingOrders: pendingCount,
      });
    }

    if (recentOrdersRes.data) {
      setRecentOrders(recentOrdersRes.data);
    }

    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hello, {merchant?.business_name} 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your store today</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ETB {stats.todaySales.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeProducts}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No orders yet</p>
                <a
                  href={`/store/${merchant?.store_url_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                >
                  Share your store to get started
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ETB {Number(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
