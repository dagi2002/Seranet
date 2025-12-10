import { useLocation, useNavigate } from 'react-router-dom';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = (location.state as { orderId?: string })?.orderId;

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="card">
        <h2>Payment successful</h2>
        <p>Your demo Telebirr payment completed.</p>
        {orderId && <p>Order: {orderId}</p>}
        <button className="button" onClick={() => navigate('/store/default')}>
          Back to store
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
