"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function ShopFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const [min, setMin] = useState(searchParams.get("min") || "");
  const [max, setMax] = useState(searchParams.get("max") || "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page on filter change
    if (key !== "page") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("min", min);
    else params.delete("min");
    if (max) params.set("max", max);
    else params.delete("max");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const categories = [
    { name: "All Categories", slug: "" },
    { name: "Laptops", slug: "laptops" },
    { name: "Smartphones", slug: "smartphones" },
    { name: "Audio", slug: "audio" },
    { name: "Accessories", slug: "accessories" },
  ];

  const FilterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => {
                  updateParam("category", cat.slug);
                  setIsOpen(false);
                }}
                className={`text-sm ${currentCategory === cat.slug ? "text-primary font-medium" : "text-gray-500 hover:text-gray-900"}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-gray-900">Price Range</h3>
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="number"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handlePriceApply} variant="outline" className="w-full">
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-6">
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full flex items-center justify-center gap-2">
          <Menu className="w-4 h-4" /> Filters
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        {FilterContent}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white p-6 overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}
    </>
  );
}
