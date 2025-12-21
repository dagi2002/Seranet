import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../lib/utils";
import { list } from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingMerchant, setLoadingMerchant] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // TEMP: Simulated logged-in merchant (JSON-server has no auth)
  const CURRENT_USER_EMAIL = "owner@example.com";

  useEffect(() => {
    async function loadData() {
      // 1️⃣ Load merchant for the "logged in" user
      const merchants = await list("merchants");
      const found = merchants.find((m) => m.owner_email === CURRENT_USER_EMAIL || m.phone);

      setMerchant(found);
      setLoadingMerchant(false);

      if (found) {
        // 2️⃣ Load products belonging to this merchant
        const allProducts = await list("products");
        setProducts(allProducts.filter((p) => p.merchant_id === found.id));
        setLoadingProducts(false);

        // 3️⃣ Load orders belonging to this merchant
        const allOrders = await list("orders");
        setOrders(allOrders.filter((o) => o.merchant_id === found.id));
        setLoadingOrders(false);
      }
    }

    loadData();
  }, []);

  const stats = [
    {
      title: "Today's Sales",
      value: `ETB ${orders
        .filter((o) => o.status === "paid")
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-emerald-500"
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "bg-blue-500"
    },
    {
      title: "Active Products",
      value: products.filter((p) => p.is_active).length,
      icon: Package,
      color: "bg-purple-500"
    }
  ];

  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
    fulfilled: { label: "Fulfilled", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 }
  };

  // If no merchant exists yet → show onboarding prompt
  if (!loadingMerchant && !merchant) {
    return (
      <div className="p-6 lg:p-10">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Seranet!</h1>
          <p className="text-slate-600 mb-8">Let's set up your store to start selling.</p>
          <Link to={createPageUrl("Onboarding")}>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Create Your Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {merchant?.owner_name || "Merchant"} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with {merchant?.business_name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                      {loadingProducts || loadingOrders ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      )}
                    </div>

                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to={createPageUrl("Products") + "?action=add"}>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              <span>Add Product</span>
            </Button>
          </Link>

          <Link to={createPageUrl("Storefront") + `?slug=${merchant?.store_url_slug}`} target="_blank">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-600" />
              <span>View Store</span>
            </Button>
          </Link>

          <Link to={createPageUrl("Orders")}>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-600" />
              <span>View Orders</span>
            </Button>
          </Link>

          <Link to={createPageUrl("StoreSettings")}>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              <span>Store Settings</span>
            </Button>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {orders.slice(0, 5).map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <Link
                      key={order.id}
                      to={createPageUrl("OrderDetail") + `?id=${order.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <StatusIcon className={`w-5 h-5 text-slate-600`} />
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            #{order.order_number || String(order.id).padStart(6, "0")}
                          </p>
                          <p className="text-sm text-slate-500">
                            {order.customer_name} •{" "}
                            {format(new Date(order.created_date), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ETB {order.total_amount?.toLocaleString()}
                        </p>
                        <Badge className={`${status.color} border-0`}>
                          {status.label}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
