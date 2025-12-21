import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { list } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Storefront() {
  const { slug } = useParams();

  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStore() {
      setLoading(true);

      // Load all merchants
      const merchants = await list("merchants");
      const found = merchants.find(m => m.store_url_slug === slug);

      if (!found) {
        setMerchant(null);
        setLoading(false);
        return;
      }

      setMerchant(found);

      // Load all products
      const allProducts = await list("products");

      // Filter products belonging to this merchant
      const merchantProducts = allProducts.filter(
        p => p.merchant_id === found.id
      );

      setProducts(merchantProducts);
      setLoading(false);
    }

    loadStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading store...
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
        <p className="text-slate-500">
          This store does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Store Header */}
      <div className="mb-10 text-center">
        {merchant.logo_url && (
          <img
            src={merchant.logo_url}
            alt="Store Logo"
            className="w-24 h-24 rounded-xl mx-auto mb-4 object-cover"
          />
        )}

        <h1 className="text-3xl font-bold">{merchant.business_name}</h1>
        <p className="text-slate-600 mt-2">{merchant.description}</p>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-slate-500">
            No products available.
          </div>
        ) : (
          products.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <h2 className="font-bold text-lg">{product.name}</h2>
              <p className="text-slate-500 mt-1">{product.description}</p>

              <div className="flex justify-between items-center mt-4">
                <span className="font-semibold text-teal-600">
                  ETB {product.price?.toLocaleString()}
                </span>

                {product.is_active ? (
                  <Badge className="bg-green-100 text-green-800">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
