"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProductAction, updateProductAction, type ProductActionData } from "@/app/admin/products/actions";
import { X, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface ProductInitialData {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  category_id?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  is_featured?: boolean;
  is_active?: boolean;
  images?: string[];
}

interface ProductFormProps {
  categories: Category[];
  initialData?: ProductInitialData;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 2 * 1024 * 1024) {
        setError(`File ${file.name} is larger than 2MB.`);
        continue;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }
    }

    setImages(newImages);
    setUploading(false);
    if (e.target) e.target.value = ''; // Reset input
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const payload: ProductActionData = {
      name: (formData.get("name") as string) || "",
      slug: (formData.get("slug") as string) || "",
      description: (formData.get("description") as string) || "",
      price: parseFloat(formData.get("price") as string) || 0,
      compare_at_price: formData.get("compare_at_price") ? parseFloat(formData.get("compare_at_price") as string) : null,
      stock: parseInt(formData.get("stock") as string, 10) || 0,
      brand: (formData.get("brand") as string) || undefined,
      category_id: (formData.get("category_id") as string) || null,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
      images: images,
    };

    if (payload.price < 0) {
      setError("Price cannot be negative.");
      setLoading(false);
      return;
    }

    if ((payload.stock ?? 0) < 0) {
      setError("Stock cannot be negative.");
      setLoading(false);
      return;
    }

    let result;
    if (isEditing && initialData?.id) {
      result = await updateProductAction(initialData.id, payload);
    } else {
      result = await createProductAction(payload);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-4">Basic Information</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Product Name *</label>
              <Input name="name" required value={name} onChange={handleNameChange} placeholder="e.g. Mechanical Keyboard" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Slug *</label>
              <Input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. mechanical-keyboard" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                name="description" 
                defaultValue={initialData?.description || ""}
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-4">Media</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-gray-50 hover:bg-primary/5">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">Max 5 images. Each up to 2MB.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-4">Pricing & Inventory</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Price (Rs.) *</label>
              <Input name="price" type="number" step="0.01" min="0" required defaultValue={initialData?.price} placeholder="0.00" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Compare at price (Rs.)</label>
              <Input name="compare_at_price" type="number" step="0.01" min="0" defaultValue={initialData?.compare_at_price} placeholder="0.00" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Stock Quantity *</label>
              <Input name="stock" type="number" step="1" min="0" required defaultValue={initialData?.stock ?? 10} placeholder="0" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-4">Organization</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              {categories.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>No categories available yet.</span>
                  <Link
                    href="/admin/categories/new"
                    className="font-semibold text-primary underline hover:text-primary-dark"
                  >
                    Create a category first
                  </Link>
                </div>
              ) : (
                <select 
                  name="category_id" 
                  required
                  defaultValue={initialData?.category_id || ""}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <Input name="brand" defaultValue={initialData?.brand || ""} placeholder="e.g. Apple" />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_active" defaultChecked={initialData ? initialData.is_active : true} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_featured" defaultChecked={initialData?.is_featured} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
