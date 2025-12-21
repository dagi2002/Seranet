import React, { useEffect, useState } from "react";
import { list, create, update, remove } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [merchant, setMerchant] = useState(null);

  const [loading, setLoading] = useState(true);

  // Add/Edit form state
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    is_active: true,
    merchant_id: null
  });

  const CURRENT_USER_EMAIL = "owner@example.com"; // temporary “logged in” user

  // Load merchant + products
  useEffect(() => {
    async function loadData() {
      const merchants = await list("merchants");
      const found = merchants.find(
        (m) => m.owner_email === CURRENT_USER_EMAIL || m.phone
      );

      setMerchant(found);

      if (found) {
        const allProducts = await list("products");
        setProducts(allProducts.filter((p) => p.merchant_id === found.id));

        setForm((prev) => ({ ...prev, merchant_id: found.id }));
      }

      setLoading(false);
    }

    loadData();
  }, []);

  function resetForm() {
    setFormMode("create");
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      is_active: true,
      merchant_id: merchant?.id
    });
  }

  // Handle create or update
  async function handleSubmit(e) {
    e.preventDefault();

    if (formMode === "create") {
      const newProduct = await create("products", form);
      setProducts((prev) => [...prev, newProduct]);
    } else {
      const updated = await update("products", editingId, form);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? updated : p))
      );
    }

    resetForm();
  }

  function handleEdit(product) {
    setFormMode("edit");
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      is_active: product.is_active,
      merchant_id: merchant.id
    });
  }

  async function handleDelete(id) {
    await remove("products", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <p className="p-6">Loading products…</p>;
  if (!merchant) return <p className="p-6">No merchant found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Product Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {formMode === "create" ? "Add New Product" : "Edit Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />

            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <span>Active</span>
            </div>

            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              {formMode === "create" ? (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            {formMode === "edit" && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="ml-2"
              >
                Cancel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Product List */}
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-0 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

                <p className="text-slate-600 mb-2">{product.description}</p>

                <p className="font-bold text-slate-900 mb-3">
                  ETB {product.price?.toLocaleString()}
                </p>

                {product.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge className="bg-slate-200 text-slate-700">Inactive</Badge>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
