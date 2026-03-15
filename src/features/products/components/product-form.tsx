import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Grip, Loader2, UploadCloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { PRODUCT_CATEGORIES, validateImageFile } from '@/utils';

const schema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Price must be greater than zero'),
  stock_quantity: z.coerce.number().min(0, 'Stock cannot be negative'),
  image_urls: z.array(z.string()).min(1, 'Add at least 1 product image').max(5, 'You can upload up to 5 images'),
  category: z.enum(['clothing', 'electronics', 'food', 'home', 'beauty', 'sports', 'other']),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function getFormValues(product?: Product | null): FormValues {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    stock_quantity: product?.stock_quantity ?? 0,
    image_urls: product?.image_urls ?? [],
    category: product?.category ?? 'other',
    is_active: product?.is_active ?? true,
  };
}

export function ProductForm({
  product,
  open,
  onOpenChange,
}: {
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getFormValues(product),
  });

  useEffect(() => {
    if (!open) return;

    form.reset(getFormValues(product));
  }, [form, open, product]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = { ...values };

      if (product) {
        return apiClient.products.update(product.id, payload);
      }

      return apiClient.products.create(payload);
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated' : 'Product added');
      queryClient.invalidateQueries({ queryKey: ['merchant-products'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save product');
    },
  });

  const uploadFile = async (file?: File) => {
    if (!file) return;
    const validationError = validateImageFile(file, 'Product image');
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (form.getValues('image_urls').length >= 5) {
      toast.error('You can upload up to 5 images per product');
      return;
    }
    setUploading(true);
    try {
      const result = await apiClient.uploads.uploadProductImage(file);
      const latestImages = form.getValues('image_urls');

      if (latestImages.includes(result.file_url)) {
        return;
      }

      if (latestImages.length >= 5) {
        toast.error('You can upload up to 5 images per product');
        return;
      }

      form.setValue('image_urls', [...latestImages, result.file_url], {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const imageUrls = form.watch('image_urls');

  const removeImage = (index: number) => {
    form.setValue(
      'image_urls',
      imageUrls.filter((_, entryIndex) => entryIndex !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;

    const nextImages = [...imageUrls];
    const [selected] = nextImages.splice(index, 1);
    if (!selected) return;
    nextImages.unshift(selected);
    form.setValue('image_urls', nextImages, { shouldDirty: true, shouldValidate: true });
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
            <Label>Product Images</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <UploadCloud className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">{uploading ? 'Uploading...' : imageUrls.length ? 'Add another product image' : 'Upload your first product image'}</p>
                <p className="text-xs text-slate-500">PNG or JPG. Minimum 1 image, maximum 5. The first image becomes the storefront thumbnail.</p>
              </div>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                disabled={imageUrls.length >= 5 || uploading}
                onChange={(event) => {
                  uploadFile(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <FieldError message={form.formState.errors.image_urls?.message} />
            {imageUrls.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {imageUrls.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img className="h-32 w-full object-cover" src={imageUrl} alt={`${form.watch('name') || 'Product'} ${index + 1}`} />
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${index === 0 ? 'store-primary-soft store-primary-text' : 'bg-slate-100 text-slate-600'}`}>
                        <Grip className="h-3 w-3" />
                        {index === 0 ? 'Primary image' : `Image ${index + 1}`}
                      </span>
                      <div className="flex gap-2">
                        {index > 0 ? (
                          <button className="font-medium text-slate-600" type="button" onClick={() => makePrimary(index)}>
                            Set primary
                          </button>
                        ) : null}
                        <button className="inline-flex items-center gap-1 font-medium text-red-600" type="button" onClick={() => removeImage(index)}>
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Storefront preview</p>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-[1.25rem] bg-white p-4 shadow-sm">
              <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{form.watch('name') || 'Product name'}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{form.watch('description') || 'A short product summary will appear here.'}</p>
                </div>
                {imageUrls[0] ? <img className="h-16 w-16 rounded-2xl object-cover" src={imageUrls[0]} alt={form.watch('name') || 'Product preview'} /> : null}
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
