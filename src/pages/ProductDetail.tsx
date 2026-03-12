import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useProduct, useMerchantBySlug } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { clampQuantity, formatCurrency } from '@/utils';
import { useState } from 'react';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug = '', productId = '' } = useParams();
  const { data: merchant } = useMerchantBySlug(slug);
  const { data: product, isLoading } = useProduct(productId);
  const cart = useSlugCart(slug);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container-shell py-10">
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  if (!merchant || !product) return null;

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container-shell">
          <Button asChild variant="ghost">
            <Link to={`/s/${slug}`}>Back to Store</Link>
          </Button>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <Card className="overflow-hidden">
              <div className="aspect-[4/4.2] bg-slate-100">
                {product.image_url ? <img className="h-full w-full object-cover" src={product.image_url} alt={product.name} /> : null}
              </div>
            </Card>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] store-primary-text">{merchant.business_name}</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{product.name}</h1>
                <p className="mt-4 text-base leading-7 text-slate-500">{product.description}</p>
              </div>

              <p className="text-3xl font-bold store-primary-text">{formatCurrency(product.price)}</p>

              <div className="flex items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <button className="rounded-full p-2 hover:bg-slate-100" onClick={() => setQuantity((value) => clampQuantity(value - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-12 px-3 text-center font-semibold">{quantity}</span>
                  <button className="rounded-full p-2 hover:bg-slate-100" onClick={() => setQuantity((value) => clampQuantity(value + 1))}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-500">{product.stock_quantity} in stock</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={product.stock_quantity === 0}
                  onClick={() => {
                    cart.addItem(product, quantity);
                    toast.success(`${product.name} added to cart`);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={product.stock_quantity === 0}
                  onClick={() => {
                    cart.addItem(product, quantity);
                    navigate(`/s/${slug}/checkout`);
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
