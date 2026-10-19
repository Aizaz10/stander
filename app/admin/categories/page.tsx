import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Search, Edit2, Image as ImageIcon, Tags } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage product categories for Stander Trader store.",
};

interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  products?: { count: number }[] | { count: number };
}

function getProductCount(cat: CategoryWithProducts): number {
  if (Array.isArray(cat.products)) {
    return cat.products[0]?.count ?? 0;
  }
  if (cat.products && typeof cat.products === "object" && "count" in cat.products) {
    return cat.products.count ?? 0;
  }
  return 0;
}

async function CategoriesList({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ q?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const searchParams = await searchParamsPromise;

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  let query = supabase
    .from("categories")
    .select("*, products(count)")
    .order("name", { ascending: true });

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  const { data: categories } = await query;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium">Products</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories && categories.length > 0 ? (
              (categories as CategoryWithProducts[]).map((category) => {
                const count = getProductCount(category);
                return (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                          {category.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          count > 0
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {count} {count === 1 ? "product" : "products"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-primary"
                            title={`Edit ${category.name}`}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <DeleteCategoryButton
                          id={category.id}
                          name={category.name}
                          productCount={count}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                      <Tags className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      {searchParams.q
                        ? `No categories matching "${searchParams.q}"`
                        : "No categories yet"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {searchParams.q
                        ? "Try searching for a different keyword or clear your query."
                        : "Categories help organize your catalog for customers in the store."}
                    </p>
                    {searchParams.q ? (
                      <Link href="/admin/categories">
                        <Button variant="outline" size="sm">
                          Clear Search
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin/categories/new">
                        <Button size="sm" className="gap-2">
                          <Plus className="w-4 h-4" /> Add Category
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize products into catalog categories.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <form method="GET" action="/admin/categories" className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Search categories..."
              className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
            />
          </form>
          <Link href="/admin/categories/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        }
      >
        <CategoriesList searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
