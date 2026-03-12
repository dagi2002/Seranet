import { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { useAuth } from '@/hooks/auth';

const LandingPage = lazy(() => import('@/pages/Landing'));
const OnboardingPage = lazy(() => import('@/pages/Onboarding'));
const OnboardingCompletePage = lazy(() => import('@/pages/OnboardingComplete'));
const StorefrontPage = lazy(() => import('@/pages/Storefront'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'));
const CheckoutPage = lazy(() => import('@/pages/Checkout'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccess'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const ProductsPage = lazy(() => import('@/pages/Products'));
const OrdersPage = lazy(() => import('@/pages/Orders'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetail'));
const StoreSettingsPage = lazy(() => import('@/pages/StoreSettings'));

function ProtectedDashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen message="Opening your merchant workspace..." />;
  if (!isAuthenticated) return <Navigate replace to="/" />;

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading workspace..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding/complete" element={<OnboardingCompletePage />} />
        <Route path="/s/:slug" element={<StorefrontPage />} />
        <Route path="/s/:slug/products/:productId" element={<ProductDetailPage />} />
        <Route path="/s/:slug/checkout" element={<CheckoutPage />} />
        <Route path="/s/:slug/payment-success/:orderId" element={<PaymentSuccessPage />} />

        <Route path="/dashboard" element={<ProtectedDashboard />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="settings" element={<StoreSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
