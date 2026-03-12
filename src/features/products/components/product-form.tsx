import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/types/seranet';
import { PRODUCT_CATEGORIES } from '@/utils';

const schema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Price must be greater than zero'),
  stock_quantity: z.coerce.number().min(0, 'Stock cannot be negative'),
  image_url: z.string().optional(),
  category: z.enum(['clothing', 'electronics', 'food', 'home', 'beauty', 'sports', 'other']),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm({
  merchantId,
  product,
  open,
  onOpenChange,
}: {
  merchantId: string;
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const defaultValues = useMemo<FormValues>(
    () => ({
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock_quantity: product?.stock_quantity ?? 0,
      image_url: product?.image_url ?? '',
      category: product?.category ?? 'other',
      is_active: product?.is_active ?? true,
    }),
    [product],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        merchant_id: merchantId,
      };

      if (product) {
        return apiClient.entities.Product.update(product.id, payload);
      }

      return apiClient.entities.Product.create(payload);
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated' : 'Product added');
      queryClient.invalidateQueries({ queryKey: ['products', merchantId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save product');
    },
  });

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.integrations.Core.UploadFile({ file });
      form.setValue('image_url', result.file_url, { shouldDirty: true });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>Keep products consistent, active, and ready for a real backend later.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input id="product-name" placeholder="Habesha Coffee Set" {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea id="product-description" placeholder="Describe the product in a way shoppers can scan quickly." {...form.register('description')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (ETB)</Label>
              <Input id="product-price" type="number" min="1" {...form.register('price')} />
              <FieldError message={form.formState.errors.price?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock Quantity</Label>
              <Input id="product-stock" type="number" min="0" {...form.register('stock_quantity')} />
              <FieldError message={form.formState.errors.stock_quantity?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as FormValues['category'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <UploadCloud className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">{uploading ? 'Uploading...' : 'Upload or replace product image'}</p>
                <p className="text-xs text-slate-500">PNG or JPG. Stored locally for this phase.</p>
              </div>
              <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadFile(event.target.files?.[0])} />
            </label>
            {form.watch('image_url') ? (
              <img className="h-32 w-full rounded-2xl object-cover" src={form.watch('image_url')} alt={form.watch('name') || 'Product preview'} />
            ) : null}
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Storefront preview</p>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{form.watch('name') || 'Product name'}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{form.watch('description') || 'A short product summary will appear here.'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">ETB {form.watch('price') || 0}</p>
                <p className="text-xs text-slate-400">Stock {form.watch('stock_quantity')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Show on storefront</p>
              <p className="text-xs text-slate-500">Inactive products stay in the dashboard only.</p>
            </div>
            <Switch checked={form.watch('is_active')} onCheckedChange={(checked) => form.setValue('is_active', checked)} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}
