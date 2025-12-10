import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';
import type { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DashboardProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });

  const load = async () => {
    if (!user) return;
    const { data } = await api.get<Product[]>(`/products?merchant=${user.id}`);
    setProducts(data);
  };

  useEffect(() => {
    load().catch((err) => console.error(err));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await api.post('/products', { ...form, merchantId: user.id, isActive: true, price: Number(form.price), stock: Number(form.stock) });
    setForm({ name: '', description: '', price: 0, stock: 0, imageUrl: '' });
    await load();
  };

  return (
    <div className="container">
      <h2>Products</h2>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Create product</h3>
        <form onSubmit={handleSubmit}>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
          <input
            className="input"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
          />
          <input
            className="input"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />
          <button className="button" type="submit">
            Save product
          </button>
        </form>
      </div>
      <div className="card">
        <h3>Existing products</h3>
        {products.map((product) => (
          <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <strong>{product.name}</strong>
              <p>ETB {product.price.toFixed(2)}</p>
            </div>
            <span>{product.stock} in stock</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardProducts;
