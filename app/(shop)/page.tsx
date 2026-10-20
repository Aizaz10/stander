import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight } from "lucide-react";
import TrendingProducts from "@/components/shop/TrendingProducts";
import TrendingProductsSkeleton from "@/components/shop/TrendingProductsSkeleton";
import { InfoStrip } from "@/components/shop/InfoStrip";

export const metadata: Metadata = {
  title: {
    absolute: "Stander Trader - Electronics & Gadgets",
  },
  description:
    "Discover the most innovative electronics, gadgets, and tech accessories at Stander Trader. Delivery across Pakistan with Cash on Delivery.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-16">
      {/* Hero Section */}
      <section className="bg-primary-light/30 pt-14 pb-16 px-4">
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

      {/* Info Strip */}
      <section className="container mx-auto px-4 -mt-4 md:-mt-6">
        <InfoStrip />
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
