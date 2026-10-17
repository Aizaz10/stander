import type { Metadata } from "next";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Learn about Stander Trader delivery options, city-based shipping rates, and 30-day returns guarantee.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Shipping & Returns
        </h1>
        <p className="text-gray-500 text-base">
          Transparent shipping timelines, flat city delivery charges (Karachi Rs. 250, other cities Rs. 350), and a hassle-free 30-day return guarantee.
        </p>
      </div>

      <div className="space-y-10">
        {/* Shipping Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Options & Rates</h2>
              <p className="text-xs text-gray-500">Fast, insured delivery on all tech devices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Karachi</span>
              <h3 className="font-bold text-gray-900 mt-1">Karachi Delivery</h3>
              <p className="text-2xl font-extrabold text-primary my-2">Rs. 250</p>
              <p className="text-xs text-gray-500">Delivered within 2–3 business days. Cash on Delivery available.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nationwide</span>
              <h3 className="font-bold text-gray-900 mt-1">Other Cities</h3>
              <p className="text-2xl font-extrabold text-primary my-2">Rs. 350</p>
              <p className="text-xs text-gray-500">Delivered within 3–5 business days to Lahore, Islamabad, and nationwide.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Payment</span>
              <h3 className="font-bold text-gray-900 mt-1">Cash on Delivery</h3>
              <p className="text-2xl font-extrabold text-green-700 my-2">COD</p>
              <p className="text-xs text-gray-500">Pay cash upon arrival at your doorstep on all orders across Pakistan.</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            All shipments include tracking numbers you can track using your order number and phone number. Fragile and high-value electronics are packed in protective shock-absorbent packaging.
          </p>
        </div>

        {/* Returns Policy */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">30-Day Return Policy</h2>
              <p className="text-xs text-gray-500">Simple, worry-free product returns</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>30 Days:</strong> You have 30 calendar days from the date of delivery to initiate a return for any eligible item.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Original Packaging:</strong> Products should be returned in original boxes with cables, manuals, and accessories included.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <strong>Fast Refunds:</strong> Once received and inspected, refunds are credited to your original payment method in 3 to 5 business days.
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-3 text-sm">How to return an item:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
            <li>Visit your <Link href="/orders" className="text-primary hover:underline">My Orders</Link> page or email <span className="font-mono text-xs">support@stander.store</span>.</li>
            <li>Provide your order number and reason for return.</li>
            <li>Attach the provided prepaid return label and drop off the package at any authorized shipping carrier.</li>
          </ol>
        </div>

        {/* Warranty Guarantee */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">1-Year Warranty Protection</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Every gadget purchased directly from Stander is covered under comprehensive 1-year manufacturer warranty. If your device experiences hardware malfunctions during normal use, we offer immediate replacement or repair.
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm">File a Warranty Claim</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
