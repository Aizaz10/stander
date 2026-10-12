import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface ProductGridSearchParams {
  category?: string;
  q?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}

export default async function ProductGrid({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<ProductGridSearchParams>;
}) {
  await connection();
  const searchParams = await searchParamsPromise;
  const supabase = await createClient();

  let query = supabase.from("products").select("*, categories!inner(name, slug)", { count: "exact" }).eq("is_active", true);

  if (searchParams.category) {
    query = query.eq("categories.slug", searchParams.category);
  }
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }
  if (searchParams.min) {
    query = query.gte("price", searchParams.min);
  }
  if (searchParams.max) {
    query = query.lte("price", searchParams.max);
  }
  
  if (searchParams.sort === "price-low") {
    query = query.order("price", { ascending: true });
  } else if (searchParams.sort === "price-high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: products, count } = await query;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
        <Link href="/shop">
          <Button>Clear Filters</Button>
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-500">Showing {products.length} of {count} products</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link href={`/product/${product.slug}`} key={product.id}>
            <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                
                {product.compare_at_price && (
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-red-500 hover:bg-red-600">Sale</Badge>
                  </div>
                )}
                
                {product.images && product.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-xl animate-pulse" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 mb-1">{product.categories?.name || 'Uncategorized'}</p>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">${product.price}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-400 line-through">${product.compare_at_price}</span>
                    )}
                  </div>
                  <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">Add</Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const params = new URLSearchParams();
            Object.entries(searchParams).forEach(([key, value]) => {
              if (value) params.set(key, String(value));
            });
            params.set("page", pageNum.toString());
            return (
              <Link key={pageNum} href={`/shop?${params.toString()}`}>
                <Button variant={pageNum === page ? "primary" : "outline"} size="sm">
                  {pageNum}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
