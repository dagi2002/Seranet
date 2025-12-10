import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div>
      <div className="navbar">
        <Link to="/store/default">Seranet Store</Link>
        <Link to="/checkout">Checkout</Link>
      </div>
      <div className="container">
        <h2>Your cart</h2>
        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="card">
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <strong>{item.name}</strong>
                  <p>ETB {item.price.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    style={{ width: 80, marginBottom: 0 }}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                  />
                  <button className="button secondary" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong>ETB {total.toFixed(2)}</strong>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link className="button" to="/checkout">
                Proceed to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
