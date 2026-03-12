import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { STORAGE_KEYS, writeStorage } from '@/services/storage';
import { slugify } from '@/utils';

const schema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  owner_name: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  store_url_slug: z.string().min(2, 'Store URL is required'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customSlug, setCustomSlug] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: '',
      owner_name: '',
      phone: '',
      store_url_slug: '',
      description: '',
      logo_url: '',
    },
  });

  const businessName = form.watch('business_name');
  const summary = useMemo(() => form.getValues(), [form, step, businessName]);

  useEffect(() => {
    if (!customSlug) {
      form.setValue('store_url_slug', slugify(businessName));
    }
  }, [businessName, customSlug, form]);

  const nextStep = async () => {
    const valid =
      step === 1
        ? await form.trigger(['business_name', 'owner_name', 'phone'])
        : step === 2
          ? await form.trigger(['store_url_slug'])
          : await form.trigger();

    if (!valid) return;
    if (step === 3) {
      writeStorage(STORAGE_KEYS.onboarding, form.getValues());
      navigate('/onboarding/complete');
      return;
    }
    setStep((current) => current + 1);
  };

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.integrations.Core.UploadFile({ file });
      form.setValue('logo_url', result.file_url, { shouldDirty: true });
      toast.success('Logo uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-shell py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Seranet</p>
              <p className="text-xs text-slate-500">Merchant onboarding</p>
            </div>
          </Link>
          <Button asChild variant="ghost">
            <Link to="/">Back Home</Link>
          </Button>
        </div>

        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="grid gap-10 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-10">
            <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-brand-700 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-200">3-step setup</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight">Bring your storefront online with the same Base44 flow.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                Capture your business details, reserve your store URL, and add a brand asset to launch the merchant workspace.
              </p>

              <div className="mt-10 flex gap-3">
                {[1, 2, 3].map((value) => (
                  <div
                    key={value}
                    className={`h-2 flex-1 rounded-full ${value <= step ? 'bg-emerald-400' : 'bg-white/15'}`}
                  />
                ))}
              </div>

              <div className="mt-8 space-y-4 text-sm text-slate-200">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold text-white">Merchant-first structure</p>
                  <p className="mt-1">Your storefront slug, theme, catalog, and orders stay cleanly separated for phase 2.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold text-white">Telebirr-ready checkout</p>
                  <p className="mt-1">The frontend keeps the local payment simulation and checkout rhythm customers expect.</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <div className="mb-8 flex items-center gap-3">
                {[1, 2, 3].map((value) => (
                  <div
                    key={value}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                      value === step ? 'bg-brand-600 text-white' : value < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {value < step ? <CheckCircle2 className="h-4 w-4" /> : value}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                  {step === 1 ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Business basics</h2>
                        <p className="mt-2 text-sm text-slate-500">Start with the merchant identity and contact details used across your store.</p>
                      </div>

                      <Field label="Business name" error={form.formState.errors.business_name?.message}>
                        <Input {...form.register('business_name')} placeholder="Abeba Home Goods" />
                      </Field>
                      <Field label="Owner name" error={form.formState.errors.owner_name?.message}>
                        <Input {...form.register('owner_name')} placeholder="Abeba Bekele" />
                      </Field>
                      <Field label="Phone" error={form.formState.errors.phone?.message}>
                        <Input {...form.register('phone')} placeholder="0911223344" />
                      </Field>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Store URL and story</h2>
                        <p className="mt-2 text-sm text-slate-500">This slug becomes your public storefront link.</p>
                      </div>
                      <Field label="Store URL" error={form.formState.errors.store_url_slug?.message}>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
                          <span className="border-r border-slate-200 px-3 text-sm text-slate-500">seranet.et/</span>
                          <Input
                            className="border-0 shadow-none focus:ring-0"
                            {...form.register('store_url_slug', {
                              onChange: () => setCustomSlug(true),
                            })}
                          />
                        </div>
                      </Field>
                      <Field label="Description">
                        <Textarea {...form.register('description')} placeholder="Tell customers what makes your business special." />
                      </Field>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Brand touch and launch summary</h2>
                        <p className="mt-2 text-sm text-slate-500">Add a logo now or swap it later in store settings.</p>
                      </div>

                      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                        <ImagePlus className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{uploading ? 'Uploading logo...' : 'Drop a logo or click to upload'}</p>
                          <p className="text-xs text-slate-500">Stored locally for MVP. Replaceable later.</p>
                        </div>
                        <input className="hidden" type="file" accept="image/*" onChange={(event) => uploadFile(event.target.files?.[0])} />
                      </label>

                      {form.watch('logo_url') ? (
                        <img className="h-36 w-full rounded-[1.5rem] object-cover" src={form.watch('logo_url')} alt="Merchant logo" />
                      ) : null}

                      <Card className="p-5">
                        <p className="text-sm font-semibold text-slate-900">Ready to launch</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex justify-between gap-4">
                            <span>Business</span>
                            <span className="font-medium text-slate-900">{summary.business_name || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Owner</span>
                            <span className="font-medium text-slate-900">{summary.owner_name || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Store URL</span>
                            <span className="font-medium text-slate-900">seranet.et/{summary.store_url_slug || 'your-store'}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" onClick={nextStep}>
                  {step === 3 ? 'Launch Store' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
