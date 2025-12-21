import React, { useState } from 'react';
import { create, list, get, update, remove } from "@/api/api";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const categories = [ 'clothing', 'electronics', 'food', 'home', 'beauty', 'sports', 'other' ];

export default function ProductForm({ product, merchantId, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || 0,
    category: product?.category || 'other',
    image_url: product?.image_url || '',
    is_active: product?.is_active !== false
  });

  // CREATE / UPDATE USING NEW API WRAPPER
  const mutation = useMutation({
    mutationFn: (data) => {
      if (product) return api.Product.update(product.id, data);
      return api.Product.create({ ...data, merchant_id: merchantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success(product ? 'Product updated' : 'Product created');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div>
        <Label>Product Image</Label>
        <div className="mt-2">
          {formData.image_url ? (
            <div className="relative">
              <img
                src={formData.image_url}
                alt="Product"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => setFormData({ ...formData, image_url: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-teal-400 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
                  <span className="text-sm text-slate-500">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">Click to upload image</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (ETB) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <Label htmlFor="is_active">Active</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-teal-600 hover:bg-teal-700"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}