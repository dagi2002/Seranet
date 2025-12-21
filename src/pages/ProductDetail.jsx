import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { list, get, update, remove } from "@/api/api";
import { createPageUrl } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail() {
  const navigate = useNavigate();
  const productId = new URLSearchParams(window.location.search).get("id");

  const [merchant, setMerchant] = useState(null);
  const [product, setProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load merchant + product
  useEffect(() => {
    async function loadData() {
      const merchants = await list("merchants");

      if (merchants.length > 0) {
        setMerchant(merchants[0]);
      }

      if (productId) {
        const prod = await get("products", productId);
        setProduct(prod);
      }
    }

    loadData();
  }, [productId]);

  if (!product) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading product details...
      </div>
    );
  }

  // Handle field updates
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  // Save updated product
  const handleSave = async () => {
    setSaving(true);

    await update("products", product.id, product);

    setSaving(false);
    alert("Product saved!");
  };

  // Delete product
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(true);

    await remove("products", product.id);

    setDeleting(false);

    alert("Product deleted!");
    navigate(createPageUrl("Products"));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <Link to={createPageUrl("Products")}>
        <Button variant="ghost" className="mb-4">
          ← Back to Products
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-6">Product Details</h1>

      {/* FORM FIELDS */}
      <div className="space-y-6">

        {/* Name */}
        <div>
          <label className="text-sm font-medium">Product Name</label>
          <Input
            name="name"
            value={product.name || ""}
            onChange={handleChange}
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-sm font-medium">Price (ETB)</label>
          <Input
            name="price"
            type="number"
            value={product.price || ""}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            rows={4}
            value={product.description || ""}
            onChange={handleChange}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Active?</label>

          <Badge
            className={`cursor-pointer px-3 ${
              product.is_active
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-600"
            }`}
            onClick={() =>
              setProduct((prev) => ({
                ...prev,
                is_active: !prev.is_active,
              }))
            }
          >
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Image URL */}
        <div>
          <label className="text-sm font-medium">Image URL</label>
          <Input
            name="image_url"
            value={product.image_url || ""}
            onChange={handleChange}
          />

          {product.image_url && (
            <img
              src={product.image_url}
              className="w-32 h-32 border rounded-lg mt-2 object-cover"
            />
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-8">

        <Button
          className="bg-teal-600 hover:bg-teal-700 flex-1"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Product"}
        </Button>

      </div>
    </div>
  );
}
