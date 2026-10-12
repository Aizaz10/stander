"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Unauthorized");
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

export async function createProductAction(data: ProductActionData) {
  try {
    const supabase = await verifyAdmin();
    
    const { data: existing } = await supabase.from('products').select('id').eq('slug', data.slug).single();
    if (existing) {
      return { error: "A product with this slug already exists. Please choose a different one." };
    }

    const { error } = await supabase.from('products').insert([data]);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return { error: message };
  }
}

export async function updateProductAction(id: string, data: Partial<ProductActionData>) {
  try {
    const supabase = await verifyAdmin();
    
    if (data.slug) {
      const { data: existing } = await supabase.from('products').select('id').eq('slug', data.slug).neq('id', id).maybeSingle();
      if (existing) {
        return { error: "A product with this slug already exists. Please choose a different one." };
      }
    }

    const { error } = await supabase.from('products').update(data).eq('id', id);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    if (data.slug) {
      revalidatePath(`/product/${data.slug}`);
    }
    
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    return { error: message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const supabase = await verifyAdmin();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    return { error: message };
  }
}
