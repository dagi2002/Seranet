import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/api/apiClient';
import { EmptyState } from '@/components/shared/empty-state';
import { MerchantThemeStyle } from '@/hooks/use-merchant-theme';
import { useMerchantBySlug, useStorefrontDeliveryZones, useStorefrontProducts } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentProvider } from '@/types/seranet';
import { formatCurrency, paymentProviderLabel } from '@/utils';

const schema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(10),
  customer_address: z.string().min(4),
  landmark_note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_METHODS: { value: PaymentProvider; label: string; description: string }[] = [
  { value: 'telebirr', label: 'Telebirr', description: 'Pay via Telebirr mobile money' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', description: 'Pay when your order arrives' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Transfer to merchant bank account' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams();
  const { data: merchant, isError: merchantError } = useMerchantBySlug(slug);
  const { data: products, isError: productsError } = useStorefrontProducts(slug);
  const { data: deliveryZones = [] } = useStorefrontDeliveryZones(slug);
  const cart = useSlugCart(slug);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('telebirr');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [bankTransferRef, setBankTransferRef] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      landmark_note: '',
    },
  });

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = selectedZone?.fee ?? 0;
  const orderTotal = cart.totalAmount + deliveryFee;

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!merchant) throw new Error('Store not found');
      if (cart.items.length === 0) throw new Error('Your cart is empty');

      const order = await apiClient.storefront.createOrder(slug, {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        landmark_note: values.landmark_note || undefined,
        payment_method: paymentMethod,
        delivery_zone_id: selectedZoneId || undefined,
        bank_transfer_ref: paymentMethod === 'bank_transfer' && bankTransferRef.trim() ? bankTransferRef.trim() : undefined,
        items: cart.items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      // For telebirr, also initiate the simulated payment flow
      if (paymentMethod === 'telebirr') {
        await apiClient.payments.initiateTelebirr(order.id, values.customer_phone);
      }

      cart.clearCart();
      return {
        id: order.id,
        accessToken: order.public_access_token,
      };
    },
    onSuccess: ({ id, accessToken }) => {
      toast.success('Order created');
      navigate(`/s/${slug}/payment-success/${id}?access=${encodeURIComponent(accessToken)}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not create order');
    },
  });

  useEffect(() => {
    if (!products) return;

    const productMap = new Map(products.map((product) => [product.id, product]));
    let changed = false;
    const nextItems = cart.items.flatMap((item) => {
      const product = productMap.get(item.id);
      if (!product || product.stock_quantity < 1) {
        changed = true;
        return [];
      }

      const quantity = Math.min(item.quantity, product.stock_quantity);
      const nextItem = {
        id: item.id,
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        quantity,
        stock_quantity: product.stock_quantity,
      };

      if (
        nextItem.name !== item.name ||
        nextItem.image_url !== item.image_url ||
        nextItem.price !== item.price ||
        nextItem.quantity !== item.quantity ||
        nextItem.stock_quantity !== item.stock_quantity
      ) {
        changed = true;
      }

      return [nextItem];
    });

    if (!changed) return;

    cart.replaceItems(nextItems);
    toast.info(
      nextItems.length
        ? 'Your cart was refreshed to match current stock and pricing.'
        : 'Your cart was cleared because those items are no longer available.',
    );
  }, [cart, products]);

  if (merchantError || productsError || !merchant) {
    return (
      <div className="container-shell py-16">
        <EmptyState icon={Trash2} title="Checkout unavailable" description="We could not load the current storefront or cart pricing. Return to the store and try again." />
      </div>
    );
  }

  return (
    <>
      <MerchantThemeStyle color={merchant.primary_color} />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container-shell">
          <Button asChild variant="ghost">
            <Link to={`/s/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          </Button>

          {cart.items.length === 0 ? (
            <div className="mt-8">
              <EmptyState icon={Trash2} title="Your cart is empty" description="Add products from the storefront before checking out." />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <Card className="space-y-5 p-6 sm:p-7">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] store-primary-text">Checkout</p>
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Complete your order</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Enter your details, choose a payment method, and place your order.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['1', 'Customer details'],
                    ['2', 'Payment method'],
                    ['3', 'Order confirmation'],
                  ].map(([stepNumber, label]) => (
                    <div key={label} className="rounded-[1.5rem] bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Step {stepNumber}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
                    </div>
                  ))}
                </div>

                <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Name</Label>
                    <Input id="customer-name" placeholder="Selamawit Tekle" {...form.register('customer_name')} />
                    <FieldError message={form.formState.errors.customer_name?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input id="customer-phone" placeholder="0911223344" {...form.register('customer_phone')} />
                    <FieldError message={form.formState.errors.customer_phone?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-address">Address</Label>
                    <Textarea id="customer-address" placeholder="Bole, Addis Ababa" {...form.register('customer_address')} />
                    <FieldError message={form.formState.errors.customer_address?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark-note">Landmark / directions (optional)</Label>
                    <Input id="landmark-note" placeholder="Near Edna Mall, blue gate" {...form.register('landmark_note')} />
                  </div>

                  {deliveryZones.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Delivery zone</Label>
                      <div className="space-y-2">
                        {deliveryZones.map((zone) => (
                          <label
                            key={zone.id}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${selectedZoneId === zone.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="delivery_zone"
                                value={zone.id}
                                checked={selectedZoneId === zone.id}
                                onChange={() => setSelectedZoneId(zone.id)}
                                className="accent-brand-600"
                              />
                              <span className="text-sm font-medium text-slate-900">{zone.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{zone.fee > 0 ? formatCurrency(zone.fee) : 'Free'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${paymentMethod === method.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={() => setPaymentMethod(method.value)}
                            className="mt-0.5 accent-brand-600"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{method.label}</p>
                            <p className="text-xs text-slate-500">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'telebirr' ? (
                    <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>Telebirr payment will be simulated through the backend after order placement.</p>
                      </div>
                    </div>
                  ) : null}

                  {paymentMethod === 'cash_on_delivery' ? (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>Pay cash when your order is delivered. The merchant will confirm payment upon receipt.</p>
                      </div>
                    </div>
                  ) : null}

                  {paymentMethod === 'bank_transfer' ? (
                    <>
                      <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>Transfer the total to the merchant's bank account. They will confirm once received.</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank-transfer-ref">Transfer reference (optional)</Label>
                        <Input
                          id="bank-transfer-ref"
                          placeholder="e.g. FT24031412345"
                          value={bankTransferRef}
                          onChange={(e) => setBankTransferRef(e.target.value)}
                        />
                        <p className="text-xs text-slate-400">Include your bank transfer reference so the merchant can verify your payment faster.</p>
                      </div>
                    </>
                  ) : null}

                  <Button className="w-full" type="submit" size="lg" variant="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {paymentMethod === 'telebirr' ? 'Pay with Telebirr' : 'Place Order'}
                  </Button>
                </form>
              </Card>

              <Card className="space-y-4 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
                    <p className="mt-1 text-sm text-slate-500">{cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} across your cart</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {merchant.business_name}
                  </span>
                </div>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-[1.5rem] bg-slate-50 p-3">
                      {item.image_url ? <img className="h-16 w-16 rounded-2xl object-cover" src={item.image_url} alt={item.name} /> : null}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="rounded-full bg-white px-2 py-1 text-sm shadow-sm transition hover:bg-slate-100"
                            onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            className="rounded-full bg-white px-2 py-1 text-sm shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={typeof item.stock_quantity === 'number' && item.quantity >= item.stock_quantity}
                            onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            className="ml-auto text-sm font-medium text-red-600"
                            onClick={() => cart.removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(cart.totalAmount)}</span>
                  </div>
                  {deliveryFee > 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Delivery ({selectedZone?.name})</span>
                      <span className="font-medium text-slate-900">{formatCurrency(deliveryFee)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Payment method</span>
                    <span className="font-medium text-slate-900">{paymentProviderLabel(paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold store-primary-text">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-red-600">{message}</p>;
}
