import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSlugCart } from '@/hooks/cart';
import type { Product } from '@/types/seranet';
import { formatCurrency } from '@/utils';

export function StoreProductCard({
  product,
  slug,
}: {
  product: Product;
  slug: string;
}) {
  const cart = useSlugCart(slug);

  return (
    <div className="group relative h-full">
      <Link
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-10 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2"
        to={`/s/${slug}/products/${product.id}`}
      />
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_26px_72px_-38px_rgba(15,23,42,0.34)] group-focus-within:ring-2 group-focus-within:ring-brand-500/30">
        <div className="relative aspect-[4/4.2] overflow-hidden bg-slate-100">
          {product.image_url ? (
            <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={product.image_url} alt={product.name} />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-100 via-white to-brand-50" />
          )}
          {product.stock_quantity === 0 ? <div className="absolute inset-0 grid place-items-center bg-slate-950/50 text-sm font-semibold text-white">Out of Stock</div> : null}
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <Badge variant="outline" className="bg-white/85 text-slate-700 backdrop-blur-md">
              {product.category}
            </Badge>
            <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Sold out'}
            </span>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
            <p className="text-sm leading-6 text-slate-500">{product.description?.slice(0, 90)}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold store-primary-text">{formatCurrency(product.price)}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Per item</p>
            </div>
            <Button
              className="relative z-20"
              type="button"
              variant="primary"
              size="sm"
              disabled={product.stock_quantity === 0}
              onClick={() => {
                cart.addItem(product, 1);
                toast.success(`${product.name} added to cart`);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
