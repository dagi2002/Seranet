import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    storeSlug: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Could not register');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '4rem auto' }}>
        <h2>Create merchant account</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Business email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Business name"
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Owner name"
            value={form.ownerName}
            onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Store slug"
            value={form.storeSlug}
            onChange={(e) => setForm((f) => ({ ...f, storeSlug: e.target.value }))}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button className="button" type="submit">
            Register
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
