import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Clock, Package, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/shop/WhatsAppIcon";
import { getWhatsAppLink, formatWhatsAppNumber } from "@/lib/whatsapp";
import { SUPPORT_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Stander Trader customer support for inquiries, order help, and feedback.",
};

export default function ContactPage() {
  const formattedPhone = formatWhatsAppNumber();
  const whatsAppHref = getWhatsAppLink("Hi Stander Trader! I have a question.");

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light/60 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          Stander Trader Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Contact Us
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Have a question about a product, your order or delivery? Message us on WhatsApp and we will reply as soon as we can.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Large Primary WhatsApp Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-blue-100/80 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/70 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-6">
              <WhatsAppIcon className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">
              Fastest Response
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-3">
              Chat Directly with Stander Trader
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Connect directly with our team on WhatsApp for instant assistance with product inquiries, order updates, stock checks, or delivery details.
            </p>

            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md hover:shadow-lg transition-all text-base w-full sm:w-auto"
            >
              <WhatsAppIcon className="w-5 h-5 shrink-0" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
            Contact Information
          </h2>

          {/* WhatsApp / Phone */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">WhatsApp / Phone</h3>
              <p className="text-base font-semibold text-gray-900 mt-0.5">{formattedPhone}</p>
              <p className="text-xs text-gray-500 mt-0.5">Available for WhatsApp messages</p>
            </div>
          </div>

          {/* Support hours */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Support hours</h3>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{SUPPORT_HOURS}</p>
              <p className="text-xs text-gray-500 mt-0.5">Prompt replies during working hours</p>
            </div>
          </div>

          {/* Order status */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Order status</h3>
              <p className="text-sm text-gray-600 mt-0.5 mb-2">
                Track your order with your order number and phone number.
              </p>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                <span>Track your order with your order number and phone number</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
