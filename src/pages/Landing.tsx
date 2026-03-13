import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  MoveRight,
  Package2,
  Palette,
  ShieldCheck,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/auth';

const features = [
  { icon: Store, title: 'Launch fast', description: 'Set up your storefront, products, and merchant profile in minutes.' },
  { icon: CreditCard, title: 'Telebirr-style checkout', description: 'Offer a payment experience that feels familiar to Ethiopian shoppers.' },
  { icon: Palette, title: 'Storefront branding', description: 'Primary color, banners, and imagery shape each merchant storefront.' },
  { icon: ShoppingCart, title: 'Cart persistence', description: 'Customers can browse, return later, and keep their cart by store.' },
  { icon: Package2, title: 'Product control', description: 'Manage stock, visibility, categories, and media from one merchant workspace.' },
  { icon: ShieldCheck, title: 'Operational visibility', description: 'Track orders, payments, and store performance from a reliable daily control panel.' },
];

const stats = [
  { label: 'Merchants onboarded', value: '180+' },
  { label: 'Avg. setup time', value: '9 min' },
  { label: 'Checkout experience', value: 'Localized' },
  { label: 'Store branding', value: 'Custom' },
];

const heroHighlights = ['Telebirr-style checkout', 'Merchant dashboard + storefront', 'Built for Ethiopian SMB operations'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      setLoginOpen(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Seranet</p>
              <p className="text-xs text-slate-500">E-commerce for Ethiopian SMBs</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#why-seranet">Why Seranet</a>
            <a href="#launch">Launch</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLoginOpen(true)}>
              Merchant Login
            </Button>
            <Button asChild variant="primary">
              <Link to="/onboarding">Start Selling</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
          <div className="container-shell relative grid gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-brand-200 bg-brand-50/90 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm"
              >
                Built for Ethiopian merchants and mobile-first customers
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-950 text-balance sm:text-6xl"
              >
                Launch a professional online store built for Ethiopian commerce.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
              >
                Seranet gives Ethiopian SMBs a polished storefront, strong brand presentation, order visibility, and a checkout
                journey shaped around local customer expectations.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Button asChild size="lg" variant="primary">
                  <Link to="/onboarding">
                    Start Selling
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/s/addis-market-studio">Preview Storefront</Link>
                </Button>
              </motion.div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {heroHighlights.map((item) => (
                  <div key={item} className="surface-panel flex items-center gap-3 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex min-h-[520px] items-center justify-center"
            >
              <div className="absolute inset-x-8 top-6 h-72 rounded-full bg-gradient-to-r from-teal-200/40 via-emerald-100/40 to-transparent blur-3xl" />
              <motion.div
                className="absolute left-0 top-2 hidden w-56 rounded-[2rem] bg-white p-4 shadow-lift md:block"
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
              >
                <div className="h-36 rounded-[1.5rem] bg-gradient-to-br from-brand-100 via-white to-emerald-100" />
                <p className="mt-4 text-sm font-semibold text-slate-900">Storefront hero</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Banner-led, mobile-first storefronts designed for modern Ethiopian brands.</p>
              </motion.div>
              <motion.div
                className="absolute right-0 top-12 w-full max-w-[22rem] rounded-[2rem] bg-slate-900 p-5 text-white shadow-2xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 7 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Merchant Workspace</p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">Seranet</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-300">Today's sales</p>
                    <p className="mt-2 text-2xl font-semibold">ETB 7,360</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-slate-300">Orders</p>
                    <p className="mt-2 text-2xl font-semibold">24</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-medium">Telebirr-style payment flow</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Conversion uplift</span>
                    <span className="font-semibold text-white">+18%</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-6 w-full max-w-xs rounded-[2rem] bg-white p-4 shadow-soft"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5.5 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Cart + checkout</p>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">ETB ready</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Persistent cart, customer details, and clear payment feedback for every order.</p>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">Order total</span>
                  <span className="text-sm font-bold text-slate-900">ETB 5,150</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="container-shell -mt-2 pb-10">
          <div className="surface-panel-strong grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="container-shell py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Everything merchants need to launch, sell, and operate online.</h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Card className="h-full p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-34px_rgba(15,23,42,0.34)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 shadow-sm">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="why-seranet" className="container-shell py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Card className="relative overflow-hidden bg-slate-900 p-8 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.24),transparent_32%)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">Why Seranet</p>
              <h3 className="mt-3 text-3xl font-bold">Merchants need software that feels local, not generic.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Seranet keeps the storefront, checkout flow, and merchant operations rooted in Ethiopian business context, with
                Telebirr familiarity and practical day-to-day workflows.
              </p>
            </Card>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                ['Merchant-ready operations', 'Orders, catalog updates, branding controls, and storefront visibility live in one streamlined workspace.'],
                ['Unified commerce flow', 'Storefront browsing, cart activity, checkout, and merchant actions stay aligned across the product.'],
                ['Responsive storefronts', 'Mobile-first browsing, adaptive product grids, and quick cart access keep shopping easy on every screen.'],
                ['Brand-forward presentation', 'Store colors, banners, and product imagery help each business look established from day one.'],
              ].map(([title, description]) => (
                <Card key={title} className="p-6 transition-transform duration-300 hover:-translate-y-1">
                  <h4 className="font-semibold text-slate-900">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="launch" className="container-shell py-14">
          <div className="rounded-[2rem] bg-gradient-to-r from-brand-600 via-teal-700 to-emerald-600 p-8 text-white shadow-lift md:p-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Launch your store</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Launch your Seranet storefront with confidence.</h2>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Set up your merchant profile, shape your storefront, and manage orders from one polished commerce platform built for
                Ethiopian businesses.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/onboarding">Start Selling</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/s/addis-market-studio">
                  Preview Storefront
                  <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container-shell flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-700">Seranet</p>
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-4 w-4" />
            <span>Commerce platform for Ethiopian SMBs</span>
          </div>
        </div>
      </footer>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Merchant Login</DialogTitle>
            <DialogDescription>Use your Seranet merchant account to continue to the dashboard.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="merchant@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLoginOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Sign In
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
