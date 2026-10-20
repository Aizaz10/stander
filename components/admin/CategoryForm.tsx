"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import { CATEGORY_NAME_MAX, CATEGORY_SLUG_MAX } from "@/lib/validation";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface CategoryInitialData {
  id?: string;
  name?: string;
  slug?: string;
  image_url?: string | null;
}

interface CategoryFormProps {
  initialData?: CategoryInitialData;
}

interface CategoryFieldErrors {
  name?: string;
  slug?: string;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url || null
  );
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugEditedManually, setSlugEditedManually] = useState(isEditing);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
    if (!slugEditedManually) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, CATEGORY_SLUG_MAX);
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEditedManually(true);
    const val = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "")
      .slice(0, CATEGORY_SLUG_MAX);
    setSlug(val);
    if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      setError(`File ${file.name} is larger than 2MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const randomId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `categories/${randomId}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      setError(`Failed to upload ${file.name}: ${uploadError.message}`);
    } else {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    }

    setUploading(false);
    if (e.target) e.target.value = "";
  };

  const removeImage = () => {
    setImageUrl(null);
  };

  const validate = (): CategoryFieldErrors => {
    const errs: CategoryFieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = "Category name is required.";
    } else if (trimmedName.length > CATEGORY_NAME_MAX) {
      errs.name = `Category name cannot exceed ${CATEGORY_NAME_MAX} characters.`;
    }

    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) {
      errs.slug = "Category slug is required.";
    } else if (trimmedSlug.length > CATEGORY_SLUG_MAX) {
      errs.slug = `Category slug cannot exceed ${CATEGORY_SLUG_MAX} characters.`;
    } else if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      errs.slug = "Slug may only contain lowercase letters, numbers, and hyphens.";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setLoading(true);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase();

    const payload = {
      name: trimmedName,
      slug: trimmedSlug,
      image_url: imageUrl,
    };

    let result;
    if (isEditing && initialData?.id) {
      result = await updateCategoryAction(initialData.id, payload);
    } else {
      result = await createCategoryAction(payload);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/categories");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl" noValidate>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="font-bold text-lg text-gray-900">Category Details</h2>

        <div className="space-y-1">
          <label htmlFor="category-name" className="text-sm font-medium text-gray-700">
            Category Name *
          </label>
          <Input
            id="category-name"
            name="name"
            required
            maxLength={CATEGORY_NAME_MAX}
            value={name}
            onChange={handleNameChange}
            error={fieldErrors.name}
            placeholder="e.g. Smart Watches"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="category-slug" className="text-sm font-medium text-gray-700">
            Slug *
          </label>
          <Input
            id="category-slug"
            name="slug"
            required
            maxLength={CATEGORY_SLUG_MAX}
            value={slug}
            onChange={handleSlugChange}
            error={fieldErrors.slug}
            placeholder="e.g. smart-watches"
          />
          <p className="text-xs text-gray-400">
            Used in URL paths like /shop?category={slug || "slug"}. Only lowercase letters, numbers, and hyphens (max {CATEGORY_SLUG_MAX}).
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="text-sm font-medium text-gray-700 block">Category Image</label>

          {imageUrl ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Category preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-gray-50 hover:bg-primary/5">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Upload Image</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
          <p className="text-xs text-gray-500">Optional. JPG, PNG, or WebP up to 2MB.</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/admin/categories">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
