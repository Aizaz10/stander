import { Banknote, Truck, MessageCircle } from "lucide-react";
import { SHIPPING_FEE_KARACHI, SHIPPING_FEE_OTHER } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";

export function InfoStrip() {
  const whatsAppHref = getWhatsAppLink("Hi Stander Trader! I have a question.");
  const deliverySubtitle = `Karachi ${formatPrice(SHIPPING_FEE_KARACHI)}, other cities ${formatPrice(SHIPPING_FEE_OTHER)}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-3.5 px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Item 1: Cash on Delivery */}
        <div className="flex items-center gap-3 py-2.5 md:py-0 md:pr-4 lg:pr-6">
          <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] text-primary flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              Cash on Delivery
            </p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">
              Pay when your order arrives
            </p>
          </div>
        </div>

        {/* Item 2: Delivery across Pakistan */}
        <div className="flex items-center gap-3 py-2.5 md:py-0 md:px-4 lg:px-6">
          <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] text-primary flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              Delivery across Pakistan
            </p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">
              {deliverySubtitle}
            </p>
          </div>
        </div>

        {/* Item 3: WhatsApp Support (Link) */}
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 py-2.5 md:py-0 md:pl-4 lg:pl-6 rounded-lg transition-colors hover:bg-gray-50/80 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors">
              WhatsApp Support
            </p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">
              Quick help on WhatsApp
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
