import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorefrontPage from './pages/StorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import DashboardHome from './pages/DashboardHome';
import DashboardProducts from './pages/DashboardProducts';
import DashboardOrders from './pages/DashboardOrders';
import DashboardSettings from './pages/DashboardSettings';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/store/:slug" element={<StorefrontPage />} />
      <Route path="/store/:slug/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route
        path="/dashboard"
        element={(
          <PrivateRoute>
            <DashboardHome />
          </PrivateRoute>
        )}
      />
      <Route
        path="/dashboard/products"
        element={(
          <PrivateRoute>
            <DashboardProducts />
          </PrivateRoute>
        )}
      />
      <Route
        path="/dashboard/orders"
        element={(
          <PrivateRoute>
            <DashboardOrders />
          </PrivateRoute>
        )}
      />
      <Route
        path="/dashboard/settings"
        element={(
          <PrivateRoute>
            <DashboardSettings />
          </PrivateRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/store/default" replace />} />
    </Routes>
  );
}

export default App;
