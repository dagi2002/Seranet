import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
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
            <Link to={`/s/${slug}`}>Back to Store</Link>
          </Button>

          {cart.items.length === 0 ? (
            <div className="mt-8">
              <EmptyState icon={Trash2} title="Your cart is empty" description="Add products from the storefront before checking out." />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <Card className="space-y-4 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] store-primary-text">Checkout</p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-900">Customer details</h1>
                  <p className="mt-2 text-sm text-slate-500">This MVP keeps Telebirr-inspired payment feedback while using local mocked services.</p>
                </div>

                <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Name</Label>
                    <Input id="customer-name" {...form.register('customer_name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input id="customer-phone" {...form.register('customer_phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-address">Address</Label>
                    <Textarea id="customer-address" {...form.register('customer_address')} />
                  </div>

                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                    Demo notice: this phase simulates Telebirr confirmation locally after order placement.
                  </div>

                  <Button className="w-full" type="submit" size="lg" variant="primary" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pay with Telebirr
                  </Button>
                </form>
              </Card>

              <Card className="space-y-4 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                      {item.image_url ? <img className="h-16 w-16 rounded-2xl object-cover" src={item.image_url} alt={item.name} /> : null}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="rounded-full bg-white px-2 py-1 text-sm shadow-sm" onClick={() => cart.setQuantity(item.id, item.quantity - 1)}>
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button className="rounded-full bg-white px-2 py-1 text-sm shadow-sm" onClick={() => cart.setQuantity(item.id, item.quantity + 1)}>
                            +
                          </button>
                          <button className="ml-auto text-sm font-medium text-red-600" onClick={() => cart.removeItem(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-2xl font-bold store-primary-text">{formatCurrency(cart.totalAmount)}</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
