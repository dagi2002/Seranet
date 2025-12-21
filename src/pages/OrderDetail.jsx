import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { create, list, get, update, remove } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  CreditCard,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetail() {
  const queryClient = useQueryClient();
  const orderId = new URLSearchParams(window.location.search).get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await api.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId
  });

  const { data: payment } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: async () => {
      const payments = await api.Payment.filter({ order_id: orderId });
      return payments[0];
    },
    enabled: !!orderId
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }) => api.Order.update(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
    }
  });

  const statusConfig = {
    pending: {
      label: 'Pending Payment',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock
    },
    paid: {
      label: 'Paid',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle
    },
    fulfilled: {
      label: 'Fulfilled',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Package
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 lg:p-10">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Order not found</h1>
          <Link to={createPageUrl('Orders')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <Link to={createPageUrl('Orders')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </Link>

        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Order #{order.order_number || order.id.slice(-6).toUpperCase()}
              </h1>
              <Badge className={`${status.color} border flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">
              {format(new Date(order.created_date), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <p className="text-3xl font-bold text-teal-600">
            ETB {order.total_amount?.toLocaleString()}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>
              {order.customer_address && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium">{order.customer_address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.product_name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ETB {(item.price_at_purchase * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-slate-900">Total</span>
                <span className="text-2xl font-bold text-teal-600">
                  ETB {order.total_amount?.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Transaction ID</p>
                    <p className="font-mono font-medium">{payment.telebirr_txn_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge className={payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="font-medium">ETB {payment.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{payment.customer_phone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No payment information available</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {order.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {order.status === 'paid' && (
                    <Button
                      onClick={() => updateStatusMutation.mutate({ status: 'fulfilled' })}
                      disabled={updateStatusMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Package className="w-4 h-4 mr-2" />
                      )}
                      Mark as Fulfilled
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateStatusMutation.mutate({ status: 'paid' })}
                        disabled={updateStatusMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Paid
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ status: 'cancelled' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
