import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import TrendingProductsSkeleton from "@/components/shop/TrendingProductsSkeleton";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Discover our collection of premium electronics, gadgets, and tech accessories at Stander Trader. Best prices and fast delivery across Pakistan.",
  alternates: {
    canonical: "/shop",
  },
};

function ShopFiltersSkeleton() {
  return (
    <>
      <div className="md:hidden mb-6 w-full h-10 bg-gray-100 rounded-xl animate-pulse" />
      <div className="hidden md:block w-64 shrink-0 space-y-8 animate-pulse">
        <div>
          <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        </div>
        <div>
          <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-100 rounded-xl" />
        </div>
        <div>
          <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    </>
  );
}

async function ShopFiltersServer() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name", { ascending: true });

  return <ShopFilters categories={categories || []} />;
}

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shop All</h1>
        <p className="text-gray-500">Discover our collection of premium electronics.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <Suspense fallback={<ShopFiltersSkeleton />}>
          <ShopFiltersServer />
        </Suspense>

        <div className="flex-1">
          <Suspense fallback={<TrendingProductsSkeleton />}>
            <ProductGrid searchParamsPromise={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
