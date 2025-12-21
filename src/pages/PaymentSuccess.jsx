import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { list, get } from "@/api/api";
import { createPageUrl } from "../lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const orderId = new URLSearchParams(window.location.search).get("order");

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!orderId) return;

      // Load order
      const orderData = await get("orders", orderId);
      setOrder(orderData);

      // Load all payments, then filter locally
      const allPayments = await list("payments");
      const foundPayment = allPayments.find((p) => p.order_id === orderId);

      setPayment(foundPayment || null);
    }

    loadData();
  }, [orderId]);

  if (!order) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-xl border-0">
        <CardContent className="p-8 text-center">

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✔</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Successful!
          </h1>

          <p className="text-slate-600 mb-6">
            Your order has been placed successfully.
          </p>

          {/* Order Summary */}
          <div className="text-left bg-slate-100 rounded-xl p-4 mb-6">
            <p className="font-medium">
              Order #{order.order_number || order.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-slate-600 mt-1">
              Total: <strong>ETB {order.total_amount?.toLocaleString()}</strong>
            </p>

            {payment ? (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  Transaction ID:
                </p>
                <p className="font-mono text-sm">{payment.telebirr_txn_id || "N/A"}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Payment record not found</p>
            )}
          </div>

          {/* Back to Store Button */}
          <Link to={createPageUrl("Storefront") + `?slug=${order.store_slug}`}>
            <Button className="bg-teal-600 hover:bg-teal-700 w-full">
              Continue Shopping
            </Button>
          </Link>

        </CardContent>
      </Card>
    </div>
  );
}
