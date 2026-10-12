import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add New Product",
  description: "Create and publish a new product in the store catalog.",
};

async function NewProductContent() {
  await connection();
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect("/");

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  
  return <ProductForm categories={categories || []} />;
}

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Add New Product</h1>
      
      <Suspense fallback={<div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse max-w-4xl" />}>
        <NewProductContent />
      </Suspense>
    </div>
  );
}
