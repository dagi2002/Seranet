import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, Palette, UploadCloud } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/api/apiClient';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useCurrentMerchant } from '@/hooks/queries';
import { MERCHANT_COLOR_SWATCHES, validateImageFile } from '@/utils';
import { Link } from 'react-router-dom';
import type { Merchant } from '@/types/seranet';

const schema = z.object({
  business_name: z.string().min(2),
  owner_name: z.string().min(2),
  phone: z.string().min(10),
  store_url_slug: z.string().min(2),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  banner_url: z.string().optional(),
  primary_color: z.string().min(4),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(merchant: Merchant): FormValues {
  return {
    business_name: merchant.business_name,
    owner_name: merchant.owner_name || '',
    phone: merchant.phone || '',
    store_url_slug: merchant.store_url_slug,
    description: merchant.description || '',
    logo_url: merchant.logo_url || '',
    banner_url: merchant.banner_url || '',
    primary_color: merchant.primary_color,
    is_active: merchant.is_active,
  };
}

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();
  const { data: merchant } = useCurrentMerchant();
  const [uploadingField, setUploadingField] = useState<'logo_url' | 'banner_url' | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: '',
      owner_name: '',
      phone: '',
      store_url_slug: '',
      description: '',
      logo_url: '',
      banner_url: '',
      primary_color: '#0D9488',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!merchant) return;
    form.reset(toFormValues(merchant));
  }, [form, merchant]);

  const mutation = useMutation({
    mutationFn: (values: FormValues): Promise<Merchant> => apiClient.merchants.updateCurrent(values),
    onSuccess: (updated) => {
      const previousSlug = merchant?.store_url_slug;

      form.reset(toFormValues(updated));
      queryClient.setQueryData(['current-merchant'], updated);
      if (previousSlug) {
        queryClient.removeQueries({ queryKey: ['merchant', previousSlug] });
      }
      queryClient.setQueryData(['merchant', updated.store_url_slug], updated);
      toast.success('Store settings saved');
      queryClient.invalidateQueries({ queryKey: ['current-merchant'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', updated.store_url_slug] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save settings');
    },
  });

  const uploadFile = async (field: 'logo_url' | 'banner_url', file?: File) => {
    if (!file) return;
    const validationError = validateImageFile(file, field === 'logo_url' ? 'Logo' : 'Banner');
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setUploadingField(field);
    try {
      const result =
        field === 'logo_url'
          ? await apiClient.uploads.uploadMerchantLogo(file)
          : await apiClient.uploads.uploadMerchantBanner(file);
      form.setValue(field, result.file_url, { shouldDirty: true });
      toast.success(field === 'logo_url' ? 'Logo updated' : 'Banner updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  if (!merchant) return null;

  const storefrontSlug = form.watch('store_url_slug') || merchant.store_url_slug;

  return (
    <div className="space-y-8">
      <MerchantThemeStyle color={form.watch('primary_color')} />
      <PageHeader
        eyebrow="Branding"
        title="Store Settings"
        description="Update merchant details, storefront visuals, and brand color while keeping the data contract backend-ready."
        actions={
          <Button asChild variant="outline">
            <Link to={`/s/${storefrontSlug}`} target="_blank" rel="noreferrer">
              Preview storefront
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <form className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Card className="space-y-6 p-6 sm:p-7">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Basic info</h2>
            <p className="text-sm text-slate-500">Keep the merchant profile clean and consistent across the dashboard and storefront.</p>
            <Field label="Business Name">
              <Input {...form.register('business_name')} />
            </Field>
            <Field label="Owner Name">
              <Input {...form.register('owner_name')} />
            </Field>
            <Field label="Phone">
              <Input {...form.register('phone')} />
            </Field>
            <Field label="Store URL slug">
              <Input {...form.register('store_url_slug')} />
            </Field>
            <Field label="Description">
              <Textarea {...form.register('description')} />
            </Field>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-6 p-6 sm:p-7">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Branding</h2>
              <p className="mt-1 text-sm text-slate-500">Logo, hero banner, and storefront accent color.</p>
            </div>

            <UploadField label="Logo" preview={form.watch('logo_url')} loading={uploadingField === 'logo_url'} onChange={(file) => uploadFile('logo_url', file)} />
            <UploadField label="Banner" preview={form.watch('banner_url')} loading={uploadingField === 'banner_url'} onChange={(file) => uploadFile('banner_url', file)} />

            <div className="space-y-3">
              <Label>Primary Color</Label>
              <div className="flex flex-wrap gap-3">
                {MERCHANT_COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-10 w-10 rounded-full border-4 ${form.watch('primary_color') === color ? 'border-slate-900' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => form.setValue('primary_color', color)}
                  />
                ))}
              </div>
              <Input {...form.register('primary_color')} />
            </div>
          </Card>

          <Card className="space-y-5 p-6 sm:p-7">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Live storefront preview</p>
                  <p className="text-sm text-slate-500">A simplified snapshot of how the current brand settings will read publicly.</p>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                <div className="relative h-28 bg-slate-100" style={{ backgroundColor: `${form.watch('primary_color')}22` }}>
                  {form.watch('banner_url') ? <img className="h-full w-full object-cover" src={form.watch('banner_url')} alt="Banner preview" /> : null}
                </div>
                <div className="flex items-center gap-4 px-4 py-4">
                  {form.watch('logo_url') ? (
                    <img className="h-14 w-14 rounded-2xl object-cover shadow-sm" src={form.watch('logo_url')} alt="Logo preview" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: form.watch('primary_color') }}>
                      {form.watch('business_name').slice(0, 1) || 'S'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{form.watch('business_name') || 'Your business name'}</p>
                    <p className="text-sm text-slate-500">{form.watch('description') || 'Store description preview appears here.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">Store Active</p>
                <p className="text-sm text-slate-500">Inactive stores stay hidden from customers.</p>
              </div>
              <Switch checked={form.watch('is_active')} onCheckedChange={(checked) => form.setValue('is_active', checked)} />
            </div>
            <Button className="w-full" type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}

function UploadField({
  label,
  preview,
  loading,
  onChange,
}: {
  label: string;
  preview?: string;
  loading: boolean;
  onChange: (file?: File) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <UploadCloud className="h-5 w-5 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-700">{loading ? 'Uploading...' : `Upload ${label.toLowerCase()}`}</p>
          <p className="text-xs text-slate-500">Uploaded through the backend media endpoint.</p>
        </div>
        <input
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event) => {
            onChange(event.target.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
      </label>
      {preview ? <img className="h-40 w-full rounded-2xl object-cover" src={preview} alt={label} /> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
