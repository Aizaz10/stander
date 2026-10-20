"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import {
  PRODUCT_NAME_MAX,
  PRODUCT_SLUG_MAX,
  PRODUCT_BRAND_MAX,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_PRICE_MAX,
  PRODUCT_STOCK_MAX,
} from "@/lib/validation";

async function verifyAdmin() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export interface ProductActionData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  category_id?: string | null;
  brand?: string;
  sku?: string;
  stock?: number;
  is_featured?: boolean;
  is_active?: boolean;
  images?: string[];
  [key: string]: unknown;
}

function validateProductData(data: Partial<ProductActionData>): string | null {
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) return "Product name is required.";
    if (trimmedName.length > PRODUCT_NAME_MAX) {
      return `Product name cannot exceed ${PRODUCT_NAME_MAX} characters.`;
    }
  }

  if (data.slug !== undefined) {
    const trimmedSlug = data.slug.trim();
    if (!trimmedSlug) return "Slug is required.";
    if (trimmedSlug.length > PRODUCT_SLUG_MAX) {
      return `Slug cannot exceed ${PRODUCT_SLUG_MAX} characters.`;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens.";
    }
  }

  if (data.brand !== undefined && data.brand) {
    if (data.brand.trim().length > PRODUCT_BRAND_MAX) {
      return `Brand cannot exceed ${PRODUCT_BRAND_MAX} characters.`;
    }
  }

  if (data.description !== undefined && data.description) {
    if (data.description.trim().length > PRODUCT_DESCRIPTION_MAX) {
      return `Description cannot exceed ${PRODUCT_DESCRIPTION_MAX} characters.`;
    }
  }

  if (data.price !== undefined) {
    if (typeof data.price !== "number" || isNaN(data.price) || data.price <= 0) {
      return "Price must be a positive number greater than 0.";
    }
    if (data.price >= PRODUCT_PRICE_MAX) {
      return "Price must be below 100,000,000.";
    }
    // Check at most 2 decimal places
    const priceStr = data.price.toString();
    if (priceStr.includes(".") && priceStr.split(".")[1].length > 2) {
      return "Price can have at most 2 decimal places.";
    }
  }

  if (data.compare_at_price !== undefined && data.compare_at_price !== null) {
    if (
      typeof data.compare_at_price !== "number" ||
      isNaN(data.compare_at_price) ||
      data.compare_at_price <= 0
    ) {
      return "Compare at price must be a positive number.";
    }
    if (data.compare_at_price >= PRODUCT_PRICE_MAX) {
      return "Compare at price must be below 100,000,000.";
    }
    const compareStr = data.compare_at_price.toString();
    if (compareStr.includes(".") && compareStr.split(".")[1].length > 2) {
      return "Compare at price can have at most 2 decimal places.";
    }
    if (data.price !== undefined && data.compare_at_price <= data.price) {
      return "Compare at price must be greater than regular price.";
    }
  }

  if (data.stock !== undefined) {
    if (
      typeof data.stock !== "number" ||
      isNaN(data.stock) ||
      !Number.isInteger(data.stock) ||
      data.stock < 0 ||
      data.stock > PRODUCT_STOCK_MAX
    ) {
      return `Stock must be a whole number between 0 and ${PRODUCT_STOCK_MAX.toLocaleString()}.`;
    }
  }

  return null;
}

export async function createProductAction(data: ProductActionData) {
  try {
    const validationError = validateProductData(data);
    if (validationError) {
      return { error: validationError };
    }

    const supabase = await verifyAdmin();

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", data.slug)
      .single();
    if (existing) {
      return {
        error:
          "A product with this slug already exists. Please choose a different one.",
      };
    }

    const { error } = await supabase.from("products").insert([data]);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create product";
    return { error: message };
  }
}

export async function updateProductAction(
  id: string,
  data: Partial<ProductActionData>
) {
  try {
    const validationError = validateProductData(data);
    if (validationError) {
      return { error: validationError };
    }

    const supabase = await verifyAdmin();

    if (data.slug) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return {
          error:
            "A product with this slug already exists. Please choose a different one.",
        };
      }
    }

    const { error } = await supabase.from("products").update(data).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    if (data.slug) {
      revalidatePath(`/product/${data.slug}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update product";
    return { error: message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const supabase = await verifyAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete product";
    return { error: message };
  }
}
