import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about orders, payments, shipping, and warranty at Stander.",
};

const FAQ_CATEGORIES = [
  {
    title: "Orders & Shipping",
    faqs: [
      {
        q: "How long does standard delivery take?",
        a: "Standard shipping typically delivers within 3 to 5 business days nationwide. Express orders are delivered within 1 to 2 business days.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order is placed, you can track its real-time status in the 'My Orders' section of your account or via the order confirmation link.",
      },
      {
        q: "Is shipping free?",
        a: "Yes! We offer free standard shipping on all orders with no minimum purchase requirement.",
      },
    ],
  },
  {
    title: "Payments & Checkout",
    faqs: [
      {
        q: "Which payment methods are accepted?",
        a: "We currently support Cash on Delivery (COD) as well as major credit/debit cards and secure digital payments.",
      },
      {
        q: "Can I cancel or modify an order after placing it?",
        a: "Orders in 'Pending' status can be modified or cancelled by contacting our support team immediately. Once an order is 'Shipped', changes cannot be made.",
      },
    ],
  },
  {
    title: "Returns & Warranty",
    faqs: [
      {
        q: "What is Stander's return policy?",
        a: "We offer a 30-day hassle-free return policy for unopened and gently tested electronics in their original packaging with all included accessories.",
      },
      {
        q: "Do devices come with a warranty?",
        a: "All gadgets and electronics sold on Stander include an authentic 1-year manufacturer warranty against hardware defects.",
      },
      {
        q: "How long do refunds take to process?",
        a: "Once we inspect your returned item, refunds are processed within 3 to 5 business days to your original payment method or bank account.",
      },
    ],
  },
];

export default function FAQPage() {
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
          Quick answers to common questions about shopping, shipping, and returns at Stander.
        </p>
      </div>

      <div className="space-y-10">
        {FAQ_CATEGORIES.map((cat, idx) => (
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
                  <p className="text-gray-600 text-sm leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Can&apos;t find what you&apos;re looking for? Reach out to our customer care team and we&apos;ll be happy to assist you.
        </p>
        <Link href="/contact">
          <Button className="gap-2">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
