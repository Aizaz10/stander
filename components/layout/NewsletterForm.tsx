"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-medium animate-fadeIn">
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <span>Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0 cursor-pointer"
      >
        Join
      </button>
    </form>
  );
}
