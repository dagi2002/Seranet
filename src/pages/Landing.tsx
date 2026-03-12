import { motion } from 'framer-motion';
import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  Package2,
  Palette,
  ShieldCheck,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';

const features = [
  { icon: Store, title: 'Launch fast', description: 'Set up your storefront, products, and merchant profile in minutes.' },
  { icon: CreditCard, title: 'Telebirr-first checkout', description: 'Keep a familiar payment experience tailored to Ethiopian shoppers.' },
  { icon: Palette, title: 'Storefront branding', description: 'Primary color, banners, and imagery shape each merchant storefront.' },
  { icon: ShoppingCart, title: 'Cart persistence', description: 'Customers can browse, return later, and keep their cart by store.' },
  { icon: Package2, title: 'Product control', description: 'Manage stock, visibility, categories, and media from a cleaner dashboard.' },
  { icon: ShieldCheck, title: 'Backend-ready architecture', description: 'Mock services now, swappable production APIs later.' },
];

const stats = [
  { label: 'Merchants onboarded', value: '180+' },
  { label: 'Avg. setup time', value: '9 min' },
  { label: 'Telebirr-ready flow', value: 'MVP' },
  { label: 'Store themes supported', value: 'Custom' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { restoreDemo } = useAuth();

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
            <Button variant="ghost" onClick={async () => { await restoreDemo(); navigate('/dashboard'); }}>
              Demo Dashboard
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
          <div className="container-shell relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
              >
                Built for Ethiopian merchants and mobile-first customers
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl"
              >
                Rebuild your storefront with a sharper dashboard and the same Base44 feel.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-xl text-lg text-slate-600"
              >
                Seranet gives merchants a polished storefront, product control, order visibility, and a Telebirr-inspired checkout
                flow that feels local from day one.
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
                  <Link to="/s/addis-market-studio">View Demo Store</Link>
                </Button>
              </motion.div>
              <div className="mt-10 flex flex-wrap gap-3">
                {['Telebirr-style payment flow', 'Multi-tenant store slugs', 'Dashboard + storefront parity'].map((item) => (
                  <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex min-h-[420px] items-center justify-center"
            >
              <motion.div className="absolute left-2 top-0 w-56 rounded-[2rem] bg-white p-4 shadow-lift" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6 }}>
                <div className="h-36 rounded-[1.5rem] bg-gradient-to-br from-brand-100 via-white to-emerald-100" />
                <p className="mt-4 text-sm font-semibold text-slate-900">Storefront hero</p>
                <p className="mt-2 text-sm text-slate-500">Banner-driven, mobile-first, Ethiopian brand palette.</p>
              </motion.div>
              <motion.div className="absolute right-4 top-12 w-72 rounded-[2rem] bg-slate-900 p-5 text-white shadow-2xl" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 7 }}>
                <p className="text-sm text-slate-300">Merchant Dashboard</p>
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
                  <p className="text-sm font-medium">Telebirr simulation</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </motion.div>
              <motion.div className="absolute bottom-0 left-16 w-60 rounded-[2rem] bg-white p-4 shadow-soft" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5.5 }}>
                <p className="text-sm font-semibold text-slate-900">Cart + checkout</p>
                <p className="mt-2 text-sm text-slate-500">Persistent cart, customer info capture, payment feedback.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="container-shell -mt-4 pb-10">
          <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="container-shell py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">A cleaner codebase without losing the original UX rhythm.</h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Card className="h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
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
            <Card className="bg-slate-900 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">Why Seranet</p>
              <h3 className="mt-3 text-3xl font-bold">Merchants need software that feels local, not generic.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The storefront, order flow, and payment simulation all stay rooted in Ethiopian business context, with Telebirr-inspired
                cues and practical merchant operations.
              </p>
            </Card>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                ['Frontend-first rebuild', 'Preserves Base44 page flow and frontend personality before phase 2 backend work.'],
                ['Reusable service contracts', 'Pages talk to one mock API surface so real APIs can replace it cleanly later.'],
                ['Responsive structure', 'Mobile drawer, adaptive product grids, floating cart actions, and storefront-first browsing.'],
                ['Polished demo data', 'Seeded merchant, products, orders, and payments make the app presentable immediately.'],
              ].map(([title, description]) => (
                <Card key={title} className="p-6">
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
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Recreate the Base44 storefront feel, then plug in the real backend in phase 2.</h2>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Start with the merchant onboarding flow, explore the demo dashboard, and confirm the storefront quality locally before
                production APIs land.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/onboarding">Start Selling</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link to="/s/addis-market-studio">Preview Demo Store</Link>
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
            <span>Frontend rebuild phase 1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
