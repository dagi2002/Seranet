import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardHome = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="navbar">
        <span>Dashboard</span>
        <div>
          <Link to="/dashboard/products">Products</Link>
          <Link to="/dashboard/orders" style={{ marginLeft: '1rem' }}>
            Orders
          </Link>
          <Link to="/dashboard/settings" style={{ marginLeft: '1rem' }}>
            Settings
          </Link>
          <button className="button secondary" style={{ marginLeft: '1rem' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Welcome, {user?.ownerName ?? user?.businessName}</h2>
        <p>Manage your store, products, and orders from the navigation links above.</p>
      </div>
    </div>
  );
};

export default DashboardHome;
