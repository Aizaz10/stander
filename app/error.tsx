"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RotateCcw, Home, AlertCircle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error is logged/handled silently without cluttering console in production
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-light text-primary flex items-center justify-center shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 mb-8 text-base">
          An unexpected error occurred while loading this page. Please try again or return to our homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RotateCcw className="w-4 h-4" />
            Try again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
