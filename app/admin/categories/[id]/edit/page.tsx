import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { CategoryForm } from "@/components/admin/CategoryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Category",
  description: "Edit category details, slug, and image.",
};

async function EditCategoryContent({ id }: { id: string }) {
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

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!category) notFound();

  return <CategoryForm initialData={category} />;
}

async function EditCategoryContentWrapper({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  return <EditCategoryContent id={params.id} />;
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to categories
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Edit Category</h1>

      <Suspense
        fallback={
          <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse max-w-2xl" />
        }
      >
        <EditCategoryContentWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}
