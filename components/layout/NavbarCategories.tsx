import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export function NavbarCategoriesFallback() {
  return (
    <nav className="space-y-1 mb-6 pb-6 border-b border-gray-100 text-sm font-medium">
      <p className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2">Shop Categories</p>
      <Link
        href="/shop"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
      >
        <span>All Products</span>
        <span className="text-xs text-gray-400">→</span>
      </Link>
    </nav>
  );
}

export async function NavbarCategories() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name", { ascending: true })
    .limit(6);

  return (
    <nav className="space-y-1 mb-6 pb-6 border-b border-gray-100 text-sm font-medium">
      <p className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2">Shop Categories</p>
      <Link
        href="/shop"
        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
      >
        <span>All Products</span>
        <span className="text-xs text-gray-400">→</span>
      </Link>
      {categories?.map((cat) => (
        <Link
          key={cat.slug}
          href={`/shop?category=${encodeURIComponent(cat.slug)}`}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
        >
          <span>{cat.name}</span>
          <span className="text-xs text-gray-400">→</span>
        </Link>
      ))}
    </nav>
  );
}
