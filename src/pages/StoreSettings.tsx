import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Loader2, MapPin, Palette, Plus, ShieldCheck, UploadCloud } from 'lucide-react';
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
import { useCurrentMerchant, useCurrentMerchantDeliveryZones } from '@/hooks/queries';
import { formatCurrency, MERCHANT_COLOR_SWATCHES, validateImageFile } from '@/utils';
import { Link } from 'react-router-dom';
import type { DeliveryZone, Merchant } from '@/types/seranet';

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
  support_phone: z.string().optional(),
  store_policy: z.string().optional(),
  return_policy: z.string().optional(),
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
    support_phone: merchant.support_phone || '',
    store_policy: merchant.store_policy || '',
    return_policy: merchant.return_policy || '',
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
      support_phone: '',
      store_policy: '',
      return_policy: '',
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
        description="Update merchant details, storefront visuals, and brand color so your public store stays consistent everywhere."
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

          <div className="space-y-4 border-t border-slate-200 pt-5">
            <h2 className="text-lg font-semibold text-slate-900">Trust & policies</h2>
            <p className="text-sm text-slate-500">Help customers feel confident buying from your store.</p>
            <Field label="Support Phone">
              <Input placeholder="0911223344" {...form.register('support_phone')} />
            </Field>
            <Field label="Store Policy">
              <Textarea placeholder="Describe your shipping, availability, or general store policies." {...form.register('store_policy')} />
            </Field>
            <Field label="Return Policy">
              <Textarea placeholder="Describe your return or refund policy." {...form.register('return_policy')} />
            </Field>
            {merchant.is_verified ? (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Verified merchant</span>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Merchant verification is managed by the platform.
              </div>
            )}
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

      <DeliveryZonesSection />
    </div>
  );
}

function DeliveryZonesSection() {
  const queryClient = useQueryClient();
  const { data: zones = [], isLoading } = useCurrentMerchantDeliveryZones();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; fee: number }) => apiClient.deliveryZones.create(data),
    onSuccess: () => {
      toast.success('Delivery zone created');
      queryClient.invalidateQueries({ queryKey: ['merchant-delivery-zones'] });
      setAdding(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not create zone'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; fee?: number; is_active?: boolean }) =>
      apiClient.deliveryZones.update(id, data),
    onSuccess: () => {
      toast.success('Delivery zone updated');
      queryClient.invalidateQueries({ queryKey: ['merchant-delivery-zones'] });
      setEditingId(null);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update zone'),
  });

  return (
    <Card className="space-y-5 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Delivery Zones</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Define areas you deliver to and their fees. Customers choose a zone at checkout.</p>
        </div>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add Zone
          </Button>
        )}
      </div>

      {adding && (
        <ZoneForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setAdding(false)}
          isPending={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading zones...</p>
      ) : zones.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-500">No delivery zones yet</p>
          <p className="text-xs text-slate-400">Add zones so customers can select their delivery area at checkout.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map((zone) =>
            editingId === zone.id ? (
              <ZoneForm
                key={zone.id}
                initial={zone}
                onSubmit={(data) => updateMutation.mutate({ id: zone.id, ...data })}
                onCancel={() => setEditingId(null)}
                isPending={updateMutation.isPending}
              />
            ) : (
              <div
                key={zone.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${zone.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {zone.name}
                    {!zone.is_active && <span className="ml-2 text-xs text-slate-400">(inactive)</span>}
                  </p>
                  <p className="text-xs text-slate-500">{zone.fee > 0 ? formatCurrency(zone.fee) : 'Free delivery'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={(checked) => updateMutation.mutate({ id: zone.id, is_active: checked })}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(zone.id)}>
                    Edit
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </Card>
  );
}

function ZoneForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: DeliveryZone;
  onSubmit: (data: { name: string; fee: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [fee, setFee] = useState(initial?.fee?.toString() ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFee = Math.max(0, Math.round(Number(fee) || 0));
    if (!name.trim()) {
      toast.error('Zone name is required');
      return;
    }
    onSubmit({ name: name.trim(), fee: parsedFee });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Zone name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bole, Kirkos" />
      </div>
      <div className="w-32 space-y-1">
        <Label className="text-xs">Fee (ETB)</Label>
        <Input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {initial ? 'Save' : 'Add'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
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
