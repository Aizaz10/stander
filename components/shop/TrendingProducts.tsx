import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function TrendingProducts() {
  await connection();
  const supabase = await createClient();
  const { data: trendingProducts } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(4);

  if (!trendingProducts || trendingProducts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-gray-500">No trending products available right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {trendingProducts.map((product) => (
        <Link href={`/product/${product.slug}`} key={product.id}>
          <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <div className="aspect-square bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              
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
                <span className="font-bold text-lg">${product.price}</span>
                <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">Add</Button>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
