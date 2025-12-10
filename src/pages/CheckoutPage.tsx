import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    try {
      setStatus('Creating order...');
      const orderRes = await api.post('/orders', {
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity, priceAtPurchase: item.price })),
        totalAmount: total,
      });
      const orderId = orderRes.data.id as string;
      setStatus('Initiating demo payment...');
      await api.post('/payments/demo/initiate', { orderId, amount: total });
      setStatus('Payment pending...');
      setTimeout(() => {
        clear();
        navigate('/checkout-success', { state: { orderId } });
      }, 3200);
    } catch (err) {
      console.error(err);
      setStatus('Failed to complete checkout.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 640, margin: '2rem auto' }}>
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <p>Total: ETB {total.toFixed(2)}</p>
          <button className="button" type="submit" disabled={items.length === 0}>
            Pay with demo Telebirr
          </button>
        </form>
        {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
      </div>
    </div>
  );
};

export default CheckoutPage;
