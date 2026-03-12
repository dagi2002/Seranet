import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { useAuth } from '@/hooks/auth';
import CheckoutPage from '@/pages/Checkout';
import DashboardPage from '@/pages/Dashboard';
import OnboardingPage from '@/pages/Onboarding';
import OnboardingCompletePage from '@/pages/OnboardingComplete';
import OrderDetailPage from '@/pages/OrderDetail';
import OrdersPage from '@/pages/Orders';
import PaymentSuccessPage from '@/pages/PaymentSuccess';
import ProductDetailPage from '@/pages/ProductDetail';
import ProductsPage from '@/pages/Products';
import StoreSettingsPage from '@/pages/StoreSettings';
import StorefrontPage from '@/pages/Storefront';
import LandingPage from '@/pages/Landing';

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
  );
}

export default App;
