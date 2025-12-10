import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import type { Merchant, Product } from '../types';
import { useCart } from '../contexts/CartContext';

const StorefrontPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      const merchantRes = await api.get<Merchant>(`/merchant/slug/${slug}`);
      setMerchant(merchantRes.data);
      const { data } = await api.get<Product[]>(`/products?merchant=${merchantRes.data.id}`);
      setProducts(data);
    };
    load().catch((err) => console.error(err));
  }, [slug]);

  return (
    <div>
      <div className="navbar">
        <Link to={`/store/${slug}`}>{merchant?.businessName ?? 'Seranet Store'}</Link>
        <div>
          <Link to="/cart">Cart</Link>
        </div>
      </div>
      <div className="container">
        <h2>Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {products.map((product) => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p style={{ fontWeight: 700 }}>ETB {product.price.toFixed(2)}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <button className="button secondary" onClick={() => addItem(product)}>
                  Add to cart
                </button>
                <Link className="button" to={`/store/${slug}/product/${product.id}`} style={{ textAlign: 'center' }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorefrontPage;
