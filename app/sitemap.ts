import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import { SITE_URL } from "@/lib/site";

async function getProductsForSitemap(): Promise<Array<{ slug: string; created_at?: string | null }>> {
  "use cache";
  cacheLife("hours");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data } = await supabase
    .from("products")
    .select("slug, created_at")
    .eq("is_active", true);

  return data || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/shipping-returns`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const products = await getProductsForSitemap();

  const productPages: MetadataRoute.Sitemap = products.map((product) => {
    const item: MetadataRoute.Sitemap[number] = {
      url: `${SITE_URL}/product/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    };

    if (product.created_at) {
      const d = new Date(product.created_at);
      if (!isNaN(d.getTime())) {
        item.lastModified = d;
      }
    }

    return item;
  });

  return [...staticPages, ...productPages];
}
