import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CurrentYear } from "./CurrentYear";
import { NewsletterForm } from "./NewsletterForm";

function FooterShopLinksFallback() {
  return (
    <ul className="space-y-2 text-sm text-gray-500">
      <li>
        <Link
          href="/shop"
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          All Products
        </Link>
      </li>
    </ul>
  );
}

async function FooterShopLinks() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name", { ascending: true })
    .limit(6);

  return (
    <ul className="space-y-2 text-sm text-gray-500">
      <li>
        <Link
          href="/shop"
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          All Products
        </Link>
      </li>
      {categories?.map((cat) => (
        <li key={cat.slug}>
          <Link
            href={`/shop?category=${encodeURIComponent(cat.slug)}`}
            className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">Stander</h3>
          <p className="text-sm text-gray-500">
            Your premium destination for the latest electronics and modern gadgets.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
          <Suspense fallback={<FooterShopLinksFallback />}>
            <FooterShopLinks />
          </Suspense>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link
                href="/track-order"
                className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-returns"
                className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Shipping Returns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-foreground">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-2">Subscribe for updates and deals.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
        &copy; <CurrentYear /> Stander. All rights reserved.
      </div>
    </footer>
  );
}
