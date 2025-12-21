import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { create, list, get, update, remove } from "@/api/api";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Orders() {
  const [merchant, setMerchant] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadMerchant() {
      const user = await api.Auth.me();
      const merchants = await api.Merchant.filter({ created_by: user.email });
      if (merchants.length > 0) setMerchant(merchants[0]);
    }
    loadMerchant();
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', merchant?.id],
    queryFn: () => api.Order.filter({ merchant_id: merchant?.id }),
    enabled: !!merchant?.id
  });

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      iconColor: 'text-yellow-600'
    },
    paid: {
      label: 'Paid',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    fulfilled: {
      label: 'Fulfilled',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Package,
      iconColor: 'text-blue-600'
    }
  };

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Track and manage customer orders</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({orderCounts.pending})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({orderCounts.paid})</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled ({orderCounts.fulfilled})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-slate-500">
              {filter === 'all' ? 'Orders will appear here when customers purchase from your store' : `No ${filter} orders right now`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, i) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Link to={createPageUrl('OrderDetail') + `?id=${order.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.color}`}>
                                <StatusIcon className={`w-6 h-6 ${status.iconColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-slate-900">
                                    Order #{order.order_number || order.id.slice(-6).toUpperCase()}
                                  </h3>
                                  <Badge className={status.color}>{status.label}</Badge>
                                </div>
                                <p className="text-sm text-slate-500">{order.customer_name} • {order.customer_phone}</p>
                                <p className="text-xs text-slate-400">
                                  {format(new Date(order.created_date), "MMM d, yyyy h:mm a")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-slate-900">
                                  ETB {order.total_amount?.toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-500">{order.items?.length || 0} items</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}