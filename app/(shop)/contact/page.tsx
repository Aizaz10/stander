import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Stander Trader customer support for inquiries, order help, and feedback.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Contact Us
        </h1>
        <p className="text-gray-500 text-base">
          Have questions about an order or need tech advice? We&apos;re here to help. Reach out to our team anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Email Us</h3>
              <p className="text-sm text-gray-500">support@stander.store</p>
              <p className="text-xs text-gray-400 mt-1">Average response time: &lt; 2 hrs</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Call Support</h3>
              <p className="text-sm text-gray-500">+1 (800) 555-0199</p>
              <p className="text-xs text-gray-400 mt-1">Toll-free customer line</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Business Hours</h3>
              <p className="text-sm text-gray-500">Monday - Friday: 9am - 6pm PST</p>
              <p className="text-xs text-gray-400 mt-1">Weekend: Emergency email support</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Headquarters</h3>
              <p className="text-sm text-gray-500">100 Tech Park Way, Suite 400</p>
              <p className="text-sm text-gray-500">San Francisco, CA 94107</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
