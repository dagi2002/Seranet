import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store, ShoppingCart, Package } from 'lucide-react';

interface Merchant {
  id: string;
  business_name: string;
  store_description: string | null;
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

export function Storefront({ slug }: { slug: string }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadStorefront();
    loadCart();
  }, [slug]);

  const loadStorefront = async () => {
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('id, business_name, store_description, logo_url, primary_color')
      .eq('store_url_slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (merchantError || !merchantData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setMerchant(merchantData);

    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, description, price, stock_quantity, image_url')
      .eq('merchant_id', merchantData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsData) {
      setProducts(productsData);
    }

    setLoading(false);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${slug}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem(`cart_${slug}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    saveCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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

            {cartCount > 0 && (
              <a
                href={`/checkout?store=${slug}`}
                className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 transition relative"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  ETB {cartTotal.toFixed(2)}
                </span>
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: merchant?.primary_color }}
                >
                  {cartCount}
                </span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {merchant?.store_description && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to {merchant.business_name}
            </h2>
            <p className="text-gray-600">{merchant.store_description}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
            <p className="text-gray-600">Check back later for new products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                <a href={`/store/${slug}?product=${product.id}`} className="block">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ETB {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.stock_quantity > 0
                          ? `${product.stock_quantity} in stock`
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </a>
                {product.stock_quantity > 0 && (
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition"
                      style={{ backgroundColor: merchant?.primary_color }}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
          <p>
            &copy; {new Date().getFullYear()} {merchant?.business_name}
          </p>
          <p className="mt-2">
            Powered by <span className="font-semibold">Seranet</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
