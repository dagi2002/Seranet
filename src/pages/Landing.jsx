import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { Button } from "@/components/ui/button";
import {
  Store,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const features = [
    {
      icon: Store,
      title: "Your Own Online Store",
      description: "Create a beautiful storefront in minutes. No coding needed."
    },
    {
      icon: CreditCard,
      title: "Telebirr Payments",
      description: "Accept mobile payments from millions of Ethiopian customers."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for how Ethiopians shop - on their phones."
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for you and your customers."
    }
  ];

  const stats = [
    { value: "1M+", label: "Potential Customers" },
    { value: "0%", label: "Monthly Fee" },
    { value: "2min", label: "Store Setup" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Seranet
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="hidden sm:flex">
                Login
              </Button>
            </Link>
            <Link to={createPageUrl('Onboarding')}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Start Selling <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Ethiopia's #1 E-commerce Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Sell Online.
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Get Paid Instantly.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Create your online store in minutes and accept Telebirr payments from customers across Ethiopia. No technical skills required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl('Onboarding')}>
                  <Button size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                    Create Free Store <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Storefront') + '?slug=demo'}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                    <Globe className="w-5 h-5 mr-2" /> View Demo Store
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Free to start
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Telebirr integrated
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  No coding needed
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-3xl blur-3xl opacity-20"></div>
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                  alt="E-commerce"
                  className="relative rounded-3xl shadow-2xl"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Received</p>
                    <p className="font-bold text-slate-900">ETB 1,250</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-teal-600">{stat.value}</p>
                <p className="text-slate-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Sell Online
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Seranet provides all the tools Ethiopian businesses need to succeed in e-commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of Ethiopian businesses already using Seranet.
          </p>
          <Link to={createPageUrl('Onboarding')}>
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-lg px-8 py-6">
              Create Your Store Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Seranet</span>
            </div>
            <p className="text-sm">© 2025 Seranet. Made for Ethiopian Businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
