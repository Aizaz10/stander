import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { SHIPPING_FEE_KARACHI, SHIPPING_FEE_OTHER } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/shop/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about orders, delivery, payment, and WhatsApp support at Stander Trader.",
};

interface FAQItem {
  q: string;
  a: ReactNode;
}

interface FAQCategory {
  title: string;
  faqs: FAQItem[];
}

export default function FAQPage() {
  const whatsAppHref = getWhatsAppLink("Hi Stander Trader! I have a question.");

  const faqCategories: FAQCategory[] = [
    {
      title: "Orders & Delivery",
      faqs: [
        {
          q: "How do I place an order?",
          a: "Add products to your cart, go to checkout, enter your name, mobile number, address and city, and place the order. You do not need an account.",
        },
        {
          q: "Do I need an account to order?",
          a: "No. You can order as a guest. An account is optional and lets you see your orders under My Orders.",
        },
        {
          q: "Is my order confirmed after I place it?",
          a: "Yes. Once you place the order on our website it is confirmed and you receive an order number.",
        },
        {
          q: "How can I track my order?",
          a: (
            <span>
              Go to{" "}
              <Link href="/track-order" className="text-primary font-medium hover:underline">
                Track Order
              </Link>
              , enter your order number and the phone number you used.
            </span>
          ),
        },
        {
          q: "How long does delivery take?",
          a: "Karachi: 2 to 3 days. Other cities: 4 to 6 days. These are estimates counted from the order date.",
        },
        {
          q: "What are the delivery charges?",
          a: `Karachi: ${formatPrice(SHIPPING_FEE_KARACHI)}. Other cities: ${formatPrice(
            SHIPPING_FEE_OTHER
          )}. Added per order at checkout.`,
        },
      ],
    },
    {
      title: "Payment & Support",
      faqs: [
        {
          q: "Which payment methods do you accept?",
          a: "Cash on Delivery only. You pay the rider when the order arrives.",
        },
        {
          q: "How can I contact you?",
          a: (
            <span>
              Message us on{" "}
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>WhatsApp</span>
                <WhatsAppIcon className="w-3.5 h-3.5 inline shrink-0" />
              </a>
              .
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 text-base">
          Quick answers to common questions about orders, delivery, and payment at Stander Trader.
        </p>
      </div>

      <div className="space-y-10">
        {faqCategories.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {cat.title}
            </h2>
            <div className="space-y-6">
              {cat.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-base flex items-start gap-2">
                    <span className="text-primary font-bold">Q.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <div className="text-gray-600 text-sm leading-relaxed pl-6">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Can&apos;t find what you&apos;re looking for? Message us on WhatsApp and we will be happy to assist you.
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
  );
}
