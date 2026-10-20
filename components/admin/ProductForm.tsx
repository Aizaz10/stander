"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createProductAction,
  updateProductAction,
  type ProductActionData,
} from "@/app/admin/products/actions";
import {
  PRODUCT_NAME_MAX,
  PRODUCT_SLUG_MAX,
  PRODUCT_BRAND_MAX,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_PRICE_MAX,
  PRODUCT_STOCK_MAX,
} from "@/lib/validation";
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

interface ProductFieldErrors {
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  compare_at_price?: string;
  stock?: string;
  brand?: string;
  category_id?: string;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compare_at_price?.toString() || ""
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined ? initialData.stock.toString() : "10"
  );
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
          .slice(0, PRODUCT_SLUG_MAX)
      );
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

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
      } else {
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }
    }

    setImages(newImages);
    setUploading(false);
    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateProduct = (): ProductFieldErrors => {
    const errors: ProductFieldErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = "Product name is required.";
    } else if (trimmedName.length > PRODUCT_NAME_MAX) {
      errors.name = `Product name cannot exceed ${PRODUCT_NAME_MAX} characters.`;
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      errors.slug = "Slug is required.";
    } else if (trimmedSlug.length > PRODUCT_SLUG_MAX) {
      errors.slug = `Slug cannot exceed ${PRODUCT_SLUG_MAX} characters.`;
    } else if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens.";
    }

    if (brand.trim().length > PRODUCT_BRAND_MAX) {
      errors.brand = `Brand cannot exceed ${PRODUCT_BRAND_MAX} characters.`;
    }

    if (description.trim().length > PRODUCT_DESCRIPTION_MAX) {
      errors.description = `Description cannot exceed ${PRODUCT_DESCRIPTION_MAX} characters.`;
    }

    // Price validation
    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.price = "Price must be a positive number greater than 0.";
    } else if (parsedPrice >= PRODUCT_PRICE_MAX) {
      errors.price = "Price must be below 100,000,000.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(price.trim())) {
      errors.price = "Price can have at most 2 decimal places.";
    }

    // Compare at price validation
    if (compareAtPrice.trim()) {
      const parsedCompare = parseFloat(compareAtPrice);
      if (isNaN(parsedCompare) || parsedCompare <= 0) {
        errors.compare_at_price = "Compare at price must be a positive number.";
      } else if (parsedCompare >= PRODUCT_PRICE_MAX) {
        errors.compare_at_price = "Compare at price must be below 100,000,000.";
      } else if (!/^\d+(\.\d{1,2})?$/.test(compareAtPrice.trim())) {
        errors.compare_at_price = "Compare at price can have at most 2 decimal places.";
      } else if (!isNaN(parsedPrice) && parsedCompare <= parsedPrice) {
        errors.compare_at_price = "Compare at price must be greater than regular price.";
      }
    }

    // Stock validation
    const parsedStock = Number(stock);
    if (stock === "" || isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0 || parsedStock > PRODUCT_STOCK_MAX) {
      errors.stock = `Stock must be a whole number between 0 and ${PRODUCT_STOCK_MAX.toLocaleString()}.`;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateProduct();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const parsedPrice = parseFloat(price);
    const parsedCompare = compareAtPrice.trim() ? parseFloat(compareAtPrice) : null;
    const parsedStock = parseInt(stock, 10);

    const payload: ProductActionData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: parsedPrice,
      compare_at_price: parsedCompare,
      stock: parsedStock,
      brand: brand.trim() || undefined,
      category_id: categoryId || null,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
      images: images,
    };

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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl" noValidate>
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
              <label htmlFor="product-name" className="text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <Input
                id="product-name"
                name="name"
                required
                value={name}
                maxLength={PRODUCT_NAME_MAX}
                onChange={handleNameChange}
                error={fieldErrors.name}
                placeholder="e.g. Mechanical Keyboard"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-slug" className="text-sm font-medium text-gray-700">
                Slug *
              </label>
              <Input
                id="product-slug"
                name="slug"
                required
                value={slug}
                maxLength={PRODUCT_SLUG_MAX}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                error={fieldErrors.slug}
                placeholder="e.g. mechanical-keyboard"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="product-desc" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <span className="text-xs text-gray-400">
                  {description.length}/{PRODUCT_DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                id="product-desc"
                name="description"
                value={description}
                maxLength={PRODUCT_DESCRIPTION_MAX}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }}
                rows={5}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2 text-sm outline-none transition-all ${
                  fieldErrors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-primary"
                }`}
              />
              {fieldErrors.description && (
                <span className="text-xs text-red-500">{fieldErrors.description}</span>
              )}
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
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
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
              <label htmlFor="product-price" className="text-sm font-medium text-gray-700">
                Price (Rs.) *
              </label>
              <Input
                id="product-price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                max="99999999.99"
                required
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: undefined }));
                }}
                error={fieldErrors.price}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-compare-price" className="text-sm font-medium text-gray-700">
                Compare at price (Rs.)
              </label>
              <Input
                id="product-compare-price"
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0.01"
                max="99999999.99"
                value={compareAtPrice}
                onChange={(e) => {
                  setCompareAtPrice(e.target.value);
                  if (fieldErrors.compare_at_price) setFieldErrors((prev) => ({ ...prev, compare_at_price: undefined }));
                }}
                error={fieldErrors.compare_at_price}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-stock" className="text-sm font-medium text-gray-700">
                Stock Quantity *
              </label>
              <Input
                id="product-stock"
                name="stock"
                type="number"
                step="1"
                min="0"
                max={PRODUCT_STOCK_MAX}
                required
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (fieldErrors.stock) setFieldErrors((prev) => ({ ...prev, stock: undefined }));
                }}
                error={fieldErrors.stock}
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-bold text-lg mb-4">Organization</h2>

            <div className="space-y-1">
              <label htmlFor="product-category" className="text-sm font-medium text-gray-700">
                Category *
              </label>
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
                  id="product-category"
                  name="category_id"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="product-brand" className="text-sm font-medium text-gray-700">
                Brand
              </label>
              <Input
                id="product-brand"
                name="brand"
                value={brand}
                maxLength={PRODUCT_BRAND_MAX}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (fieldErrors.brand) setFieldErrors((prev) => ({ ...prev, brand: undefined }));
                }}
                error={fieldErrors.brand}
                placeholder="e.g. Apple"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={initialData ? initialData.is_active : true}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible in store)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={initialData?.is_featured}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Product
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
