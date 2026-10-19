import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add New Category",
  description: "Create and publish a new product category.",
};

async function NewCategoryContent() {
  await connection();
  const supabase = await createClient();

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

  return <CategoryForm />;
}

export default function NewCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to categories
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Add New Category</h1>

      <Suspense
        fallback={
          <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse max-w-2xl" />
        }
      >
        <NewCategoryContent />
      </Suspense>
    </div>
  );
}
