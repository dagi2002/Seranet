import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { create, list, get, update, remove } from "@/api/api";
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const slug = new URLSearchParams(window.location.search).get('slug');
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [slug]);

  const { data: merchant } = useQuery({
    queryKey: ['merchant', slug],
    queryFn: async () => {
      const merchants = await api.Merchant.filter({ store_url_slug: slug });
      return merchants[0];
    },
    enabled: !!slug
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const order = await api.Order.create(orderData);

      await api.Payment.create({
        order_id: order.id,
        merchant_id: merchant.id,
        amount: orderData.total_amount,
        customer_phone: orderData.customer_phone,
        telebirr_txn_id: `TB-${Date.now()}`,
        status: 'initiated'
      });

      return order;
    },
    onSuccess: (order) => {
      localStorage.removeItem(`cart_${slug}`);
      navigate(createPageUrl('PaymentSuccess') + `?slug=${slug}&orderId=${order.id}`);
    }
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrderMutation.mutate({
      merchant_id: merchant.id,
      order_number: `ORD-${Date.now()}`,
      ...formData,
      items: cart,
      total_amount: subtotal,
      status: 'pending'
    });
  };

  // UI stays EXACTLY the same below
  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .store-primary { background-color: ${primaryColor}; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link to={createPageUrl('Storefront') + `?slug=${slug}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-bold text-slate-900">Checkout</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">ETB {item.price?.toLocaleString()} each</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ETB {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 mt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">Full Name</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Phone Number (Telebirr)</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      required
                      className="mt-1"
                      placeholder="e.g., 0912345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_address">Delivery Address</Label>
                    <Input
                      id="customer_address"
                      value={formData.customer_address}
                      onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Total & Payment */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                      ETB {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Demo Mode: Payment will be simulated. In production, Telebirr payment would be processed here.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending || !formData.customer_name || !formData.customer_phone}
                  className="w-full store-primary text-white"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ETB ${subtotal.toLocaleString()}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
