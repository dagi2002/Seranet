import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Store } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    owner_name: '',
    phone: '',
    store_url_slug: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'business_name' && !formData.store_url_slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '');
      setFormData(prev => ({ ...prev, store_url_slug: slug }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^09\d{8}$/.test(formData.phone)) {
      setError('Phone number must be in format 09XXXXXXXX');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      {
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        store_url_slug: formData.store_url_slug,
      }
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Store</h1>
          <p className="text-gray-600 mt-2">Join Seranet and start selling today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Etho Clothes"
              />
            </div>

            <div>
              <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                id="owner_name"
                name="owner_name"
                type="text"
                value={formData.owner_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Abebe Kebede"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="merchant@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="0912345678"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="store_url_slug" className="block text-sm font-medium text-gray-700 mb-2">
              Store URL
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 bg-gray-100 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg text-sm">
                seranet.et/
              </span>
              <input
                id="store_url_slug"
                name="store_url_slug"
                type="text"
                value={formData.store_url_slug}
                onChange={handleChange}
                required
                pattern="[a-z0-9]+"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="ethoclothes"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Lowercase letters and numbers only</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating your store...' : 'Create Store'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
