import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Search, Edit2 } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export const metadata: Metadata = {
  title: "Products Management",
  description: "Manage inventory, products, and categories for Stander store.",
};

async function ProductsList({ searchParamsPromise }: { searchParamsPromise: Promise<{ q?: string }> }) {
  await connection();
  const supabase = await createClient();
  const searchParams = await searchParamsPromise;
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect("/");

  let query = supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
  
  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`);
  }

  const { data: products } = await query;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                        {product.images && product.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.categories?.name || '-'}</td>
                  <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={product.stock <= 5 ? "text-red-600 font-bold" : "text-gray-900"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {product.is_active ? (
                        <Badge className="bg-green-100 text-green-800 border-none">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-none">Inactive</Badge>
                      )}
                      {product.is_featured && (
                        <Badge className="bg-purple-100 text-purple-800 border-none">Featured</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-gray-500 hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-4">
          <form method="GET" action="/admin/products" className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              name="q"
              placeholder="Search products..." 
              className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
            />
          </form>
          <Link href="/admin/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <ProductsList searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
