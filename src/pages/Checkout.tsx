import { useEffect, useState, FormEvent } from 'react';
import { api } from '../lib/apiPlaceholders';
import { Store, Package, Trash2, ShoppingCart } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string;
}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  quantity: number;
}

export function Checkout({ slug }: { slug: string }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMerchant();
    loadCart();
  }, [slug]);

  const loadMerchant = async () => {
    try {
      const data = await api.getMerchantBySlug(slug);

      if (data) {
        setMerchant(data);
      }
    } catch (error) {
      console.error('Failed to load merchant', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: Math.max(0, Math.min(item.stock_quantity, newQuantity)) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    updateCart(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId);
    updateCart(newCart);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const simulateDemoPayment = async (
    orderId: string,
    amount: number,
    customerPhone: string
  ) => {
    await api.demoPayment(orderId, amount, customerPhone);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!merchant || cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!/^09\d{8}$/.test(formData.customer_phone)) {
      setError('Phone number must be in format 09XXXXXXXX');
      return;
    }

    setLoading(true);

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const orderData = await api.createOrder({
        merchant_id: merchant.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address || null,
        total_amount: totalAmount,
        items: cart.map((item) => ({
          order_id: '',
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
      });

      await simulateDemoPayment(orderData.id, totalAmount, formData.customer_phone);

      localStorage.removeItem(`cart_${slug}`);

      window.location.href = `/checkout-success?order=${orderData.id}`;
    } catch (paymentError) {
      console.error('Checkout failed', paymentError);
      setError('Failed to complete checkout. Please try again.');
    }

    setLoading(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <a
            href={`/store/${slug}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {merchant?.logo_url ? (
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="h-10 w-auto"
                />
              ) : (
                <Store className="w-8 h-8" style={{ color: merchant?.primary_color }} />
              )}
              <span className="ml-3 text-xl font-bold text-gray-900">
                {merchant?.business_name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">ETB {item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ETB {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Abebe Kebede"
                  />
                </div>

                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Telebirr)
                  </label>
                  <input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    pattern="09\d{8}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0912345678"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 09XXXXXXXX</p>
                </div>

                <div>
                  <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address (Optional)
                  </label>
                  <textarea
                    id="customer_address"
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Bole, Behind Sheger Building"
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Total</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>ETB {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Calculated later</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>ETB {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 px-6 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: merchant?.primary_color }}
              >
                {loading ? 'Processing...' : 'Pay with Telebirr'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You will receive a Telebirr payment prompt on your phone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
