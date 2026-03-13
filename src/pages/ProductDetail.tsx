import { Minus, PackageSearch, Plus, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { StoreProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useMerchantBySlug, useStorefrontProduct, useStorefrontProducts } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { clampQuantity, formatCurrency } from '@/utils';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug = '', productId = '' } = useParams();
  const { data: merchant, isError: merchantError } = useMerchantBySlug(slug);
  const { data: product, isLoading, isError: productError } = useStorefrontProduct(slug, productId);
  const { data: products = [] } = useStorefrontProducts(slug);
  const cart = useSlugCart(slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.image_urls.length) return product.image_urls;
    return product.image_url ? [product.image_url] : [];
  }, [product]);
  const activeImage = selectedImage && galleryImages.includes(selectedImage)
    ? selectedImage
    : galleryImages[0];

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(undefined);
  }, [productId]);

  useEffect(() => {
    setSelectedImage(galleryImages[0]);
  }, [product?.id, galleryImages]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const otherProducts = products.filter((item) => item.id !== product.id);
    const sameCategory = otherProducts.filter((item) => item.category === product.category);
    const fallbackProducts = otherProducts.filter((item) => item.category !== product.category);

    return [...sameCategory, ...fallbackProducts].slice(0, 4);
  }, [product, products]);

  if (isLoading) {
    return (
      <div className="container-shell py-10">
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  if (merchantError || productError || !merchant || !product) {
    return (
      <div className="container-shell py-16">
        <EmptyState icon={PackageSearch} title="Product not available" description="This product could not be loaded or is no longer available in this storefront." />
      </div>
    );
  }

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container-shell">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost">
              <Link to={`/s/${slug}`}>Back to Store</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/s/${slug}/checkout`}>
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cart.itemCount ? <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{cart.itemCount}</span> : null}
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <Card className="overflow-hidden">
              <div className="aspect-[4/4.2] bg-slate-100">
                {activeImage ? <img className="h-full w-full object-cover" src={activeImage} alt={product.name} /> : null}
              </div>
              {galleryImages.length > 1 ? (
                <div className="grid grid-cols-5 gap-3 border-t border-slate-200 bg-white p-4">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-2xl border transition ${
                        activeImage === imageUrl ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <img className="aspect-square w-full object-cover" src={imageUrl} alt={`${product.name} view ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] store-primary-text">{merchant.business_name}</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">{product.name}</h1>
                <p className="mt-4 text-base leading-7 text-slate-500">{product.description}</p>
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Price</p>
                <p className="mt-2 text-3xl font-bold store-primary-text">{formatCurrency(product.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="rounded-full p-2 transition hover:bg-slate-100"
                    onClick={() => setQuantity((value) => clampQuantity(value - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-12 px-3 text-center font-semibold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="rounded-full p-2 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={quantity >= product.stock_quantity}
                    onClick={() => setQuantity((value) => clampQuantity(value + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">{product.stock_quantity} in stock</p>
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

          {relatedProducts.length ? (
            <section className="mt-14 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] store-primary-text">More from this store</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Related products</h2>
                  <p className="mt-2 text-sm text-slate-500">Browse a few more items from {merchant.business_name} before checkout.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <StoreProductCard key={relatedProduct.id} product={relatedProduct} slug={slug} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
      <Button asChild className="fixed bottom-4 right-4 md:hidden" variant="primary" size="lg">
        <Link to={`/s/${slug}/checkout`}>
          <ShoppingCart className="h-4 w-4" />
          Cart ({cart.itemCount})
        </Link>
      </Button>
    </>
  );
}
