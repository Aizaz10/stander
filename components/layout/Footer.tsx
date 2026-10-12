"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CurrentYear } from './CurrentYear';
import { CheckCircle2 } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">Stander</h3>
          <p className="text-sm text-gray-500">Your premium destination for the latest electronics and modern gadgets.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/shop?category=laptops" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Laptops</Link></li>
            <li><Link href="/shop?category=smartphones" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Smartphones</Link></li>
            <li><Link href="/shop?category=audio" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Audio</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/contact" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">FAQs</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Shipping Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-2">Subscribe for updates and deals.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Thanks for subscribing!</span>
            </div>
          ) : (
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
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
        &copy; <CurrentYear /> Stander. All rights reserved.
      </div>
    </footer>
  );
}
