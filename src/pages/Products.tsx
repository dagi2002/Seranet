import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit3, PackageSearch, PlusCircle, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/features/products/components/product-form';
import { useCurrentMerchant, useProductsByMerchant } from '@/hooks/queries';
import type { Product } from '@/types/seranet';
import { formatCurrency } from '@/utils';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: merchant } = useCurrentMerchant();
  const { data: products = [], isLoading } = useProductsByMerchant(merchant?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [products, searchQuery],
  );
  const activeProducts = products.filter((product) => product.is_active).length;
  const lowStockCount = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 5).length;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.entities.Product.remove(id),
    onSuccess: () => {
      toast.success('Product removed');
      queryClient.invalidateQueries({ queryKey: ['products', merchant?.id] });
    },
  });

  if (!merchant) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage the storefront assortment with reusable product forms, media uploads, and simple state controls."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Search products by name" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricPill label="Catalog items" value={String(products.length)} />
            <MetricPill label="Visible" value={String(activeProducts)} />
            <MetricPill label="Low stock" value={String(lowStockCount)} />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      ) : filteredProducts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_72px_-38px_rgba(15,23,42,0.34)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {product.image_url ? (
                  <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={product.image_url} alt={product.name} />
                ) : <div className="h-full w-full bg-gradient-to-br from-slate-100 via-white to-brand-50" />}
                {product.stock_quantity === 0 ? <div className="absolute inset-0 grid place-items-center bg-slate-950/50 text-sm font-semibold text-white">Out of Stock</div> : null}
                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                  <Badge variant={product.is_active ? 'success' : 'outline'} className="bg-white/90 text-slate-700 backdrop-blur-md">{product.is_active ? 'Active' : 'Hidden'}</Badge>
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    className="rounded-full bg-white p-2 text-slate-700 shadow-sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-full bg-white p-2 text-red-600 shadow-sm"
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name}?`)) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{product.description?.slice(0, 76) || 'No description yet.'}</p>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3">
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
                  <span className={`text-sm font-medium ${product.stock_quantity <= 5 ? 'text-amber-700' : 'text-slate-500'}`}>
                    Stock: {product.stock_quantity}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Add your first product or adjust the search query."
          actionLabel="Create product"
          onAction={() => setShowForm(true)}
        />
      )}

      <ProductForm merchantId={merchant.id} open={showForm} onOpenChange={setShowForm} product={editingProduct} />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-center sm:text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
