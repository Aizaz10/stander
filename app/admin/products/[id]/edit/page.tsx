import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details, pricing, and images.",
};

async function EditProductContent({ id }: { id: string }) {
  await connection();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect("/");

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*').eq('id', id).single()
  ]);
  
  if (!product) notFound();
  
  return <ProductForm categories={categories || []} initialData={product} />;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Edit Product</h1>
      
      <Suspense fallback={<div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse max-w-4xl" />}>
        <EditProductContentWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}

async function EditProductContentWrapper({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  return <EditProductContent id={params.id} />;
}
