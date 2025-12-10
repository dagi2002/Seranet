import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  const { id, slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      setProduct(data);
    };
    load().catch((err) => console.error(err));
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div>
      <div className="navbar">
        <Link to={`/store/${slug}`}>Back to store</Link>
        <div>
          <Link to="/cart">Cart</Link>
        </div>
      </div>
      <div className="container">
        <div className="card">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p style={{ fontWeight: 700 }}>ETB {product.price.toFixed(2)}</p>
          <button className="button" onClick={() => addItem(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
