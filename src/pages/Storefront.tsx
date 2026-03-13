import { motion } from 'framer-motion';
import { ArrowRight, Search, ShoppingCart, Sparkles, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StoreProductCard } from '@/components/storefront/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useMerchantBySlug, useStorefrontProducts } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCT_CATEGORIES } from '@/utils';

export default function StorefrontPage() {
  const { slug = '' } = useParams();
  const { data: merchant, isLoading: merchantLoading, isError: merchantError } = useMerchantBySlug(slug);
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useStorefrontProducts(slug);
  const cart = useSlugCart(slug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | (typeof PRODUCT_CATEGORIES)[number]['value']>('all');
  const merchantImage = merchant?.logo_url || merchant?.banner_url;

  useEffect(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, [slug]);

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

  if (merchantError || productsError) {
    return (
      <div className="container-shell py-16">
        <EmptyState icon={Store} title="Storefront unavailable" description="We could not load this storefront right now. Refresh the page or try again shortly." />
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
              {merchantImage ? (
                <img className="h-11 w-11 rounded-2xl object-cover" src={merchantImage} alt={merchant.business_name} />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: merchant.primary_color }}>
                  {merchant.business_name.slice(0, 1)}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{merchant.business_name}</p>
                <p className="text-xs text-slate-500">{merchant.owner_name}</p>
              </div>
            </Link>
            <Link className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300" to={`/s/${slug}/checkout`}>
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cart.itemCount ? <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{cart.itemCount}</span> : null}
            </Link>
          </div>
        </header>

        <main className="pb-20">
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 store-primary-soft" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent" />
            <div className="container-shell relative py-10 lg:py-14">
              <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 shadow-soft backdrop-blur-xl">
                <div className="relative aspect-[16/6] min-h-[220px] overflow-hidden bg-slate-200">
                  {merchant.banner_url ? <img className="h-full w-full object-cover" src={merchant.banner_url} alt={merchant.business_name} /> : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-950/20 to-transparent" />
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
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 flex flex-wrap gap-3">
                      {['Fast local ordering', 'Telebirr-style checkout', 'Curated catalog'].map((item) => (
                        <span key={item} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
                          {item}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container-shell mt-2">
            <div className="surface-panel-strong p-4 md:p-5">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" placeholder="Search the catalog" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category ? 'store-primary-bg text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setSelectedCategory(category as typeof selectedCategory)}
                    >
                      {category === 'all' ? 'All products' : category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  Premium storefront treatment
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <ShoppingCart className="h-4 w-4 text-brand-600" />
                  Persistent cart by store
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <ArrowRight className="h-4 w-4 text-brand-600" />
                  Ready for fast checkout
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
                    <StoreProductCard product={product} slug={slug} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Search} title="No products found" description="Try another search term or switch categories." />
            )}
          </section>
        </main>

        <Link className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full store-primary-bg px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:brightness-95 md:hidden" to={`/s/${slug}/checkout`}>
          <ShoppingCart className="h-4 w-4" />
          Cart ({cart.itemCount})
        </Link>
      </div>
    </>
  );
}
