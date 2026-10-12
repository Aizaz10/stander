import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export default async function ProductDetails({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  await connection();
  const params = await paramsPromise;
  const slug = params.slug;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) {
    notFound();
  }

  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("category_id", product.category_id)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  const discountPercent = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-12 overflow-hidden border border-gray-100">
            {product.images && product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-xl animate-pulse" />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} view ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-primary bg-primary-light px-3 py-1 rounded-full">
              {product.categories?.name || 'Uncategorized'}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-2">{product.name}</h1>
          
          {product.brand && (
            <p className="text-gray-500 mb-6">by <span className="font-semibold text-gray-700">{product.brand}</span></p>
          )}

          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">${product.price}</span>
            {product.compare_at_price && (
              <>
                <span className="text-xl text-gray-400 line-through mb-1">${product.compare_at_price}</span>
                <Badge className="bg-red-500 mb-2">{discountPercent}% OFF</Badge>
              </>
            )}
          </div>

          <div className="prose prose-sm text-gray-600 mb-8 max-w-none whitespace-pre-wrap">
            <p>{product.description || "No description available."}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                (product.stock ?? 0) > 5 ? 'bg-green-500' : 
                (product.stock ?? 0) > 0 ? 'bg-orange-500' : 
                'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {(product.stock ?? 0) > 5 ? "In stock" : 
                 (product.stock ?? 0) > 0 ? `Only ${product.stock} left` : 
                 "Out of stock"}
              </span>
            </div>
          </div>

          <div className="mt-auto space-y-4 border-t border-gray-100 pt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link href={`/product/${p.slug}`} key={p.id}>
                <Card className="group cursor-pointer hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                    
                    {p.compare_at_price && (
                      <div className="absolute top-3 left-3 z-20">
                        <Badge className="bg-red-500 hover:bg-red-600">Sale</Badge>
                      </div>
                    )}
                    
                    {p.images && p.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-xl animate-pulse" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-sm text-gray-500 mb-1">{p.categories?.name || 'Uncategorized'}</p>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">${p.price}</span>
                        {p.compare_at_price && (
                          <span className="text-sm text-gray-400 line-through">${p.compare_at_price}</span>
                        )}
                      </div>
                      <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">Add</Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
