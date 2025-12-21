import React, { useEffect, useState } from "react";
import { list, update } from "@/api/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function StoreSettings() {
  const [merchant, setMerchant] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadMerchant() {
      const merchants = await list("merchants");

      // Since no auth system exists, load the "first" merchant
      if (merchants.length > 0) {
        setMerchant(merchants[0]);
      }
    }

    loadMerchant();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMerchant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!merchant) return;

    setSaving(true);

    await update("merchants", merchant.id, merchant);

    setSaving(false);
    alert("Store settings updated!");
  };

  if (!merchant) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading store settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

      <div className="space-y-6">

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <Input
            name="business_name"
            value={merchant.business_name || ""}
            onChange={handleChange}
          />
        </div>

        {/* Store URL Slug */}
        <div>
          <label className="block text-sm font-medium mb-1">Store URL Slug</label>
          <div className="flex">
            <span className="px-3 py-2 bg-slate-100 text-slate-600 rounded-l-md border border-r-0">
              seranet.et/
            </span>
            <Input
              name="store_url_slug"
              value={merchant.store_url_slug || ""}
              onChange={(e) =>
                setMerchant((prev) => ({
                  ...prev,
                  store_url_slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                }))
              }
              className="rounded-l-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone (Telebirr)</label>
          <Input
            name="phone"
            value={merchant.phone || ""}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Store Description</label>
          <Textarea
            name="description"
            value={merchant.description || ""}
            rows={4}
            onChange={handleChange}
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium mb-1">Logo URL</label>
          <Input
            name="logo_url"
            value={merchant.logo_url || ""}
            onChange={handleChange}
          />

          {merchant.logo_url && (
            <img
              src={merchant.logo_url}
              alt="Logo Preview"
              className="w-24 h-24 mt-3 rounded-lg object-cover border"
            />
          )}
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="mt-8 w-full bg-teal-600 hover:bg-teal-700"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
