"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { CATEGORY_NAME_MAX, CATEGORY_SLUG_MAX } from "@/lib/validation";

async function verifyAdmin() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Unauthorized");
  return supabase;
}

export interface CategoryActionData {
  name: string;
  slug: string;
  image_url?: string | null;
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryAction(data: CategoryActionData) {
  try {
    const supabase = await verifyAdmin();

    const name = data.name?.trim();
    const rawSlug = data.slug?.trim().toLowerCase();
    const slug = sanitizeSlug(rawSlug || name || "");

    if (!name) {
      return { error: "Category name is required." };
    }

    if (name.length > CATEGORY_NAME_MAX) {
      return { error: `Category name cannot exceed ${CATEGORY_NAME_MAX} characters.` };
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: "Category slug can only contain lowercase letters, numbers, and hyphens." };
    }

    if (slug.length > CATEGORY_SLUG_MAX) {
      return { error: `Category slug cannot exceed ${CATEGORY_SLUG_MAX} characters.` };
    }

    // Check duplicate name
    const { data: existingName } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', name)
      .maybeSingle();

    if (existingName) {
      return { error: "A category with this name already exists." };
    }

    // Check duplicate slug
    const { data: existingSlug } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingSlug) {
      return { error: "A category with this slug already exists." };
    }

    const { error } = await supabase.from('categories').insert([{
      name,
      slug,
      image_url: data.image_url || null,
    }]);

    if (error) {
      if (error.code === '23505') {
        return { error: "A category with this name/slug already exists." };
      }
      throw error;
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return { error: message };
  }
}

export async function updateCategoryAction(id: string, data: Partial<CategoryActionData>) {
  try {
    const supabase = await verifyAdmin();

    const payload: Partial<CategoryActionData> = {};

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        return { error: "Category name cannot be empty." };
      }
      if (name.length > CATEGORY_NAME_MAX) {
        return { error: `Category name cannot exceed ${CATEGORY_NAME_MAX} characters.` };
      }
      // Check duplicate name
      const { data: existingName } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', name)
        .neq('id', id)
        .maybeSingle();

      if (existingName) {
        return { error: "A category with this name already exists." };
      }
      payload.name = name;
    }

    if (data.slug !== undefined) {
      const slug = sanitizeSlug(data.slug);
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return { error: "Category slug can only contain lowercase letters, numbers, and hyphens." };
      }
      if (slug.length > CATEGORY_SLUG_MAX) {
        return { error: `Category slug cannot exceed ${CATEGORY_SLUG_MAX} characters.` };
      }
      // Check duplicate slug
      const { data: existingSlug } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle();

      if (existingSlug) {
        return { error: "A category with this slug already exists." };
      }
      payload.slug = slug;
    }

    if (data.image_url !== undefined) {
      payload.image_url = data.image_url || null;
    }

    const { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { error: "A category with this name/slug already exists." };
      }
      throw error;
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    return { error: message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = await verifyAdmin();

    // Check if category has any products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      throw countError;
    }

    if (count && count > 0) {
      return {
        error: `This category has ${count} product${count > 1 ? 's' : ''}. Move or delete those products first.`
      };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      // Map foreign key constraint error to friendly message
      if (error.code === '23503' || error.message?.includes('foreign key') || error.message?.includes('products_category_id_fkey')) {
        return { error: "This category has products. Move or delete those products first." };
      }
      throw error;
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");
    revalidatePath("/shop");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete category";
    return { error: message };
  }
}
