import { useState, FormEvent, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { placeholderUpdateMerchant } from '../lib/apiPlaceholders';
import { Save, ExternalLink, Upload } from 'lucide-react';

export function StoreSettings() {
  const { merchant } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    store_description: '',
    logo_url: '',
    primary_color: '#2563eb',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (merchant) {
      setFormData({
        business_name: merchant.business_name,
        store_description: merchant.store_description || '',
        logo_url: merchant.logo_url || '',
        primary_color: merchant.primary_color,
      });
    }
  }, [merchant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!merchant) {
      setError('Merchant not found');
      setLoading(false);
      return;
    }

    
    // TODO: Replace with PUT /merchants from Express backend
    const { error: updateError } = await placeholderUpdateMerchant(merchant.id, {
      business_name: formData.business_name,
      store_description: formData.store_description,
      logo_url: formData.logo_url || null,
      primary_color: formData.primary_color,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    setLoading(false);
  };

  const storeUrl = `${window.location.origin}/store/${merchant?.store_url_slug}`;

  return (
    <DashboardLayout currentPage="settings">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-1">Customize your store appearance</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store URL</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={storeUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
            />
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center font-medium"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Visit
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this URL with your customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Store Customization</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
              Settings saved successfully!
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="EthoClothes Official"
              />
            </div>

            <div>
              <label htmlFor="store_description" className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                id="store_description"
                name="store_description"
                value={formData.store_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="High-quality clothing, delivered to you"
              />
            </div>

            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  id="logo_url"
                  name="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/logo.png"
                />
                <button
                  type="button"
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Upload logo"
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {formData.logo_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 w-auto object-contain border border-gray-200 rounded-lg p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="h-12 w-24 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This color will be used for buttons and accents in your store
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
