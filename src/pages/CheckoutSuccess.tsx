import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function CheckoutSuccess() {
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order');
    if (id) {
      setOrderId(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>

        <p className="text-gray-600 mb-6">
          Thank you for your order. You will receive a Telebirr payment confirmation shortly.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              #{orderId.slice(0, 8)}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
