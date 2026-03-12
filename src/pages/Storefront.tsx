import { motion } from 'framer-motion';
import { Search, ShoppingCart, Store } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/empty-state';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useProductsByMerchant, useMerchantBySlug } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCT_CATEGORIES, formatCurrency } from '@/utils';
import { useMemo, useState } from 'react';

export default function StorefrontPage() {
  const { slug = '' } = useParams();
  const { data: merchant, isLoading: merchantLoading } = useMerchantBySlug(slug);
  const { data: products = [], isLoading: productsLoading } = useProductsByMerchant(merchant?.id, true);
  const cart = useSlugCart(slug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | (typeof PRODUCT_CATEGORIES)[number]['value']>('all');

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' ? true : product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, searchQuery, selectedCategory],
  );

  if (merchantLoading) {
    return (
      <div className="container-shell py-10">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!merchant || !merchant.is_active) {
    return (
      <div className="container-shell py-16">
        <EmptyState icon={Store} title="Store not found" description="This storefront is inactive or the slug does not match any merchant." />
      </div>
    );
  }

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
          <div className="container-shell flex h-16 items-center justify-between gap-4">
            <Link className="flex items-center gap-3" to={`/s/${merchant.store_url_slug}`}>
              <img className="h-11 w-11 rounded-2xl object-cover" src={merchant.logo_url || merchant.banner_url} alt={merchant.business_name} />
              <div>
                <p className="font-semibold text-slate-900">{merchant.business_name}</p>
                <p className="text-xs text-slate-500">{merchant.owner_name}</p>
              </div>
            </Link>
            <Link className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft" to={`/s/${slug}/checkout`}>
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cart.itemCount ? <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{cart.itemCount}</span> : null}
            </Link>
          </div>
        </header>

        <main className="pb-20">
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 store-primary-soft" />
            <div className="container-shell relative py-10 lg:py-14">
              <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-soft">
                <div className="relative aspect-[16/6] min-h-[220px] overflow-hidden bg-slate-200">
                  {merchant.banner_url ? <img className="h-full w-full object-cover" src={merchant.banner_url} alt={merchant.business_name} /> : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                    <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                      Ethiopian commerce, modern storefront
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">
                      {merchant.business_name}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                      {merchant.description}
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container-shell mt-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" placeholder="Search the catalog" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedCategory === category ? 'store-primary-bg text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setSelectedCategory(category as typeof selectedCategory)}
                    >
                      {category === 'all' ? 'All products' : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="container-shell mt-8">
            {productsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-80 w-full" />
                ))}
              </div>
            ) : filteredProducts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <Card className="group h-full overflow-hidden">
                      <Link className="block" to={`/s/${slug}/products/${product.id}`}>
                        <div className="relative aspect-[4/4.2] overflow-hidden bg-slate-100">
                          {product.image_url ? <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={product.image_url} alt={product.name} /> : null}
                          {product.stock_quantity === 0 ? <div className="absolute inset-0 grid place-items-center bg-slate-950/50 text-sm font-semibold text-white">Out of Stock</div> : null}
                        </div>
                      </Link>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-900">{product.name}</h3>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <p className="text-sm leading-6 text-slate-500">{product.description?.slice(0, 78)}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold store-primary-text">{formatCurrency(product.price)}</p>
                          <Button
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Search} title="No products found" description="Try another search term or switch categories." />
            )}
          </section>
        </main>

        <Link className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full store-primary-bg px-5 py-3 text-sm font-semibold text-white shadow-lift md:hidden" to={`/s/${slug}/checkout`}>
          <ShoppingCart className="h-4 w-4" />
          Cart ({cart.itemCount})
        </Link>
      </div>
    </>
  );
}
