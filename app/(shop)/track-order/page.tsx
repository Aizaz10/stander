import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackOrderForm } from "./TrackOrderForm";
import { PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track the real-time fulfillment status of your Stander order with your order number and phone number.",
};

function TrackOrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-10 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
      <div className="h-11 bg-gray-200 rounded-xl w-36 ml-auto" />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Track Your Order
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Enter your order number and the phone number provided at checkout to view real-time fulfillment and tracking details.
        </p>
      </div>

      <Suspense fallback={<TrackOrderSkeleton />}>
        <TrackOrderForm />
      </Suspense>
    </div>
  );
}
