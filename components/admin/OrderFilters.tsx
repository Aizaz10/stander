"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrderFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "all";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const updateFilters = (newStatus?: string, newQuery?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus !== undefined) {
      if (newStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", newStatus);
      }
    }

    if (newQuery !== undefined) {
      if (newQuery.trim()) {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }
    }

    // Reset pagination to page 1 on filter changes
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateFilters(undefined, "");
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => updateFilters(tab.value, undefined)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer or ID..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export function OrderFiltersSkeleton() {
  return (
    <div className="space-y-4 mb-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-9 w-full sm:w-72 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
