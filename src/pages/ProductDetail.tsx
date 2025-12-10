import { useEffect, useState } from 'react';
import { api } from '../lib/apiPlaceholders';
import { Store, ShoppingCart, Package, Minus, Plus, ArrowLeft } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

export function ProductDetail({ slug, productId }: { slug: string; productId: string }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProductDetail();
  }, [slug, productId]);

  const loadProductDetail = async () => {
    try {
      const merchantData = await api.getMerchantBySlug(slug);

      if (!merchantData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setMerchant(merchantData);

      const productData = await api.getProductById(productId);

      if (!productData || productData.merchant_id !== merchantData.id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product detail', error);
      setNotFound(true);
    }

    setLoading(false);
  };

  const addToCart = () => {
    if (!product) return;

    const savedCart = localStorage.getItem(`cart_${slug}`);
    let cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      cart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      cart = [...cart, { ...product, quantity }];
    }

    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    window.location.href = `/store/${slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <a
            href={`/store/${slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to store
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
        <a
          href={`/store/${slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to store
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                <Package className="w-32 h-32 text-gray-300" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ETB {product.price.toFixed(2)}
              </span>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Stock Available</p>
              <p className="text-lg font-semibold text-gray-900">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} units`
                  : 'Out of stock'}
              </p>
            </div>

            {product.stock_quantity > 0 && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock_quantity, quantity + 1))
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition flex items-center justify-center"
                  style={{ backgroundColor: merchant?.primary_color }}
                >
                  <ShoppingCart className="w-6 h-6 mr-2" />
                  Add to Cart - ETB {(product.price * quantity).toFixed(2)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
