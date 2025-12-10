import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DashboardOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Order[]>(`/orders?merchant=${user.id}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, [user]);

  return (
    <div className="container">
      <h2>Orders</h2>
      <div className="card">
        {orders.map((order) => (
          <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <strong>{order.customerName}</strong>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p>ETB {order.totalAmount.toFixed(2)}</p>
              <p>Status: {order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOrders;
