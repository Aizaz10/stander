import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Order Placed",
  description: "Your order has been placed successfully.",
};

async function OrderSuccessContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ order?: string }>;
}) {
  const { order } = await searchParamsPromise;
  const orderNum = order && !isNaN(Number(order)) && Number(order) > 0 ? Number(order) : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center">
      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Order placed successfully!
      </h1>

      {orderNum ? (
        <div className="my-6 inline-block bg-green-50/70 border border-green-200/80 px-6 py-3 rounded-2xl">
          <p className="text-xs uppercase font-semibold text-green-700 tracking-wider mb-0.5">
            Order Confirmation
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-extrabold text-green-800">
            #{orderNum}
          </p>
        </div>
      ) : null}

      <p className="text-gray-600 text-base max-w-md mx-auto mb-8 leading-relaxed">
        Keep this number. You can track your order anytime with your order number and phone number.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
        <Link
          href={orderNum ? `/track-order?order=${orderNum}` : "/track-order"}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full gap-2">
            <PackageSearch className="w-4 h-4" /> Track Order
          </Button>
        </Link>
        <Link href="/shop" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function OrderSuccessSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center animate-pulse">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-6" />
      <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
      <div className="h-14 bg-gray-100 rounded-2xl w-48 mx-auto mb-6" />
      <div className="h-4 bg-gray-100 rounded w-80 mx-auto mb-8" />
      <div className="h-12 bg-gray-100 rounded-xl w-64 mx-auto" />
    </div>
  );
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Suspense fallback={<OrderSuccessSkeleton />}>
        <OrderSuccessContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
