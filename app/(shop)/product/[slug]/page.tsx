import { Suspense } from "react";
import type { Metadata } from "next";
import ProductDetails from "@/components/shop/ProductDetails";
import ProductLoading from "./loading";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select("name, description, images, brand, categories(name)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    const categoryName = (product.categories as { name?: string } | null)?.name;
    const fallbackDesc = product.brand && categoryName
      ? `Buy ${product.name} by ${product.brand} in ${categoryName} at Stander Trader. Enjoy best prices and fast delivery across Pakistan.`
      : product.brand
      ? `Buy ${product.name} by ${product.brand} at Stander Trader. Enjoy best prices and fast delivery across Pakistan.`
      : categoryName
      ? `Buy ${product.name} in ${categoryName} at Stander Trader. Enjoy best prices and fast delivery across Pakistan.`
      : `Buy ${product.name} at Stander Trader with warranty and fast delivery across Pakistan.`;

    const description = product.description && product.description.trim()
      ? product.description.trim().slice(0, 155)
      : fallbackDesc;

    const canonicalUrl = `/product/${slug}`;
    const hasImages = Array.isArray(product.images) && product.images.length > 0;
    const ogImages = hasImages ? [product.images[0]] : undefined;

    return {
      title: product.name,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: product.name,
        description,
        url: canonicalUrl,
        ...(ogImages ? { images: ogImages } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        ...(ogImages ? { images: ogImages } : {}),
      },
    };
  } catch {
    return {
      title: "Product Details",
    };
  }
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductDetails paramsPromise={params} />
    </Suspense>
  );
}
