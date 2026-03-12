import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UploadCloud } from 'lucide-react';
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
import { MERCHANT_COLOR_SWATCHES } from '@/utils';

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
    form.reset({
      business_name: merchant.business_name,
      owner_name: merchant.owner_name || '',
      phone: merchant.phone || '',
      store_url_slug: merchant.store_url_slug,
      description: merchant.description || '',
      logo_url: merchant.logo_url || '',
      banner_url: merchant.banner_url || '',
      primary_color: merchant.primary_color,
      is_active: merchant.is_active,
    });
  }, [form, merchant]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => apiClient.entities.Merchant.update(merchant!.id, values),
    onSuccess: () => {
      toast.success('Store settings saved');
      queryClient.invalidateQueries({ queryKey: ['current-merchant'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', merchant?.store_url_slug] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save settings');
    },
  });

  const uploadFile = async (field: 'logo_url' | 'banner_url', file?: File) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const result = await apiClient.integrations.Core.UploadFile({ file });
      form.setValue(field, result.file_url, { shouldDirty: true });
      toast.success(field === 'logo_url' ? 'Logo updated' : 'Banner updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  if (!merchant) return null;

  return (
    <div className="space-y-8">
      <MerchantThemeStyle color={form.watch('primary_color')} />
      <PageHeader
        eyebrow="Branding"
        title="Store Settings"
        description="Update merchant details, storefront visuals, and brand color while keeping the data contract backend-ready."
      />

      <form className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Card className="space-y-6 p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Basic info</h2>
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
          <Card className="space-y-6 p-6">
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

          <Card className="space-y-4 p-6">
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
          <p className="text-xs text-slate-500">Stored locally for phase 1.</p>
        </div>
        <input className="hidden" type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0])} />
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
