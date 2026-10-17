import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import TrendingProducts from "@/components/shop/TrendingProducts";
import TrendingProductsSkeleton from "@/components/shop/TrendingProductsSkeleton";

export const metadata: Metadata = {
  title: {
    absolute: "Stander Trader - Electronics & Gadgets",
  },
  description:
    "Discover the most innovative electronics, gadgets, and tech accessories at Stander Trader. Enjoy reliable warranties and fast delivery across Pakistan.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="bg-primary-light/30 pt-20 pb-24 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge className="mb-6">New Arrivals 2026</Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Tech that elevates <span className="text-primary">your lifestyle</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Discover the most innovative electronics and gadgets tailored for modern professionals and tech enthusiasts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" className="gap-2">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Fast Delivery", desc: "Same day dispatch on orders before 2PM" },
            { icon: Shield, title: "Secure Checkout", desc: "100% protected payments" },
            { icon: Truck, title: "Free Returns", desc: "30-day money back guarantee" },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-50">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
          <Link href="/shop">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        
        <Suspense fallback={<TrendingProductsSkeleton />}>
          <TrendingProducts />
        </Suspense>
      </section>
    </div>
  );
}
