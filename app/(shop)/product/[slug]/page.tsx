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
      .select("name, description, images")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: product.name,
      description: product.description || `Buy ${product.name} at Stander with fast shipping and warranty.`,
      openGraph: {
        title: `${product.name} | Stander`,
        description: product.description || `Buy ${product.name} at Stander.`,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch {
    return {
      title: "Product Details",
      description: "Product details and pricing on Stander.",
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
