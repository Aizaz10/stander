import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Clock,
  Banknote,
  MapPin,
  PackageCheck,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SHIPPING_FEE_KARACHI, SHIPPING_FEE_OTHER } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/shop/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "Delivery across Pakistan with Cash on Delivery. Delivery time and charges for Karachi and other cities.",
};

export default function ShippingReturnsPage() {
  const whatsAppHref = getWhatsAppLink(
    "Hi Stander Trader! I have a question about shipping and delivery."
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Shipping &amp; Delivery
        </h1>
        <p className="text-gray-500 text-base">
          Delivery across Pakistan with Cash on Delivery. Delivery time and charges for Karachi and other cities.
        </p>
      </div>

      <div className="space-y-8">
        {/* a) Delivery Areas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delivery Areas</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            We deliver across Pakistan.
          </p>
        </div>

        {/* b) Delivery Time */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Time</h2>
              <p className="text-xs text-gray-500">Estimated delivery duration from order date</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Estimated Delivery Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">Karachi</td>
                  <td className="px-4 py-3.5">2 to 3 days</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">Other cities</td>
                  <td className="px-4 py-3.5">4 to 6 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Delivery times are estimates, counted from the day you place your order.
          </p>
        </div>

        {/* c) Delivery Charges */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Charges</h2>
              <p className="text-xs text-gray-500">Flat shipping rate added at checkout</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Delivery Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr className="hover:bg-gray-50/50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">Karachi</td>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    {formatPrice(SHIPPING_FEE_KARACHI)} per order
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">Other cities</td>
                  <td className="px-4 py-3.5 font-semibold text-primary">
                    {formatPrice(SHIPPING_FEE_OTHER)} per order
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            The charge is added at checkout based on the city you select.
          </p>
        </div>

        {/* d) Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            We accept Cash on Delivery only. Please pay the delivery rider when your order arrives.
          </p>
        </div>

        {/* e) Order Confirmation & Tracking */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Order Confirmation &amp; Tracking</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            Your order is confirmed as soon as you place it on our website. You will get an order number. Use it with your phone number on the Track Order page to see your order status.
          </p>
          <Link href="/track-order">
            <Button className="gap-2">
              <span>Track Your Order</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* f) Tips for smooth delivery */}
        <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Tips for smooth delivery</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Enter a correct mobile number and a complete address (house or street, area, city) so the rider can reach you without delay.
          </p>
        </div>

        {/* g) Closing Need help? */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Need help?</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
            Questions about your delivery or an order? Message us on WhatsApp and we will be happy to assist you.
          </p>
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all text-sm shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
