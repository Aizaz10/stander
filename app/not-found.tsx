import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8 text-base">
          Sorry, we couldn&apos;t find the page you were looking for. It may have been moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <ShoppingBag className="w-4 h-4" />
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
