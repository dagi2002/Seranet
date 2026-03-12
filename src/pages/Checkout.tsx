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
import { useMerchantBySlug } from '@/hooks/queries';
import { useSlugCart } from '@/hooks/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateOrderNumber, formatCurrency } from '@/utils';

const schema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(10),
  customer_address: z.string().min(4),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams();
  const { data: merchant } = useMerchantBySlug(slug);
  const cart = useSlugCart(slug);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!merchant) throw new Error('Store not found');
      if (cart.items.length === 0) throw new Error('Your cart is empty');

      const order = await apiClient.entities.Order.create({
        merchant_id: merchant.id,
        order_number: generateOrderNumber(),
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        items: cart.items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
        total_amount: cart.totalAmount,
        status: 'pending',
      });

      await apiClient.entities.Payment.create({
        order_id: order.id,
        merchant_id: merchant.id,
        amount: order.total_amount,
        customer_phone: values.customer_phone,
        status: 'initiated',
      });

      cart.clearCart();
      return order.id;
    },
    onSuccess: (orderId) => {
      toast.success('Order created');
      navigate(`/s/${slug}/payment-success/${orderId}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not create order');
    },
  });

  if (!merchant) return null;

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
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Customer details</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-500">This MVP keeps Telebirr-inspired payment feedback while using local mocked services.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['1', 'Customer details'],
                    ['2', 'Telebirr simulation'],
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

                  <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>Demo notice: this phase simulates Telebirr confirmation locally after order placement.</p>
                    </div>
                  </div>

                  <Button className="w-full" type="submit" size="lg" variant="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pay with Telebirr
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
                          <button type="button" className="rounded-full bg-white px-2 py-1 text-sm shadow-sm transition hover:bg-slate-100" onClick={() => cart.setQuantity(item.id, item.quantity - 1)}>
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            className="rounded-full bg-white px-2 py-1 text-sm shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={typeof item.stock_quantity === 'number' && item.quantity >= item.stock_quantity}
                            onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button type="button" className="ml-auto text-sm font-medium text-red-600" onClick={() => cart.removeItem(item.id)}>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Payment method</span>
                    <span className="font-medium text-slate-900">Telebirr demo</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold store-primary-text">{formatCurrency(cart.totalAmount)}</span>
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
