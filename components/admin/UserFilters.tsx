"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";

export function UserFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
    }

    // Reset pagination to page 1
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    handleSearch("");
  };

  return (
    <div className="mb-6 flex justify-end">
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}

export function UserFiltersSkeleton() {
  return (
    <div className="mb-6 flex justify-end animate-pulse">
      <div className="h-9 w-full sm:w-72 bg-gray-100 rounded-xl" />
    </div>
  );
}
