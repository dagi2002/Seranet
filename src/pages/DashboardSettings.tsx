import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Merchant } from '../types';

const DashboardSettings = () => {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState<Partial<Merchant>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await api.put(`/merchant/${user.id}`, form);
    setStatus('Saved');
    await refresh();
  };

  return (
    <div className="container">
      <h2>Store settings</h2>
      <div className="card" style={{ maxWidth: 540 }}>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Business name"
            value={form.businessName ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Owner name"
            value={form.ownerName ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Logo URL"
            value={form.logoUrl ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          />
          <button className="button" type="submit">
            Save settings
          </button>
          {status && <p>{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default DashboardSettings;
