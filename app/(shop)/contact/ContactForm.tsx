"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
          Thank you for reaching out, {formData.name || "friend"}! A member of our support team will get back to you at {formData.email || "your email"} within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
          }}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            required
            placeholder="Alex Morgan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <Input
          label="Subject"
          required
          placeholder="Question about an order or product"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            required
            rows={5}
            placeholder="Write your message here..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto gap-2" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
