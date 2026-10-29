"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: string | null;
  images: string[] | null;
}

export interface SearchBoxProps {
  autoFocus?: boolean;
  isMobile?: boolean;
  onSelectOrSubmit?: () => void;
  className?: string;
}

function sanitizeSearchQuery(input: string): string {
  return input
    .slice(0, 60)
    .replace(/[%,\(\)*\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function SearchBox({
  autoFocus = false,
  isMobile = false,
  onSelectOrSubmit,
  className = "",
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);

  const baseId = useId();
  const dropdownId = `search-listbox-${baseId.replace(/:/g, "")}`;

  // Calculate total navigable options
  const totalOptions = !isLoading
    ? products.length > 0
      ? products.length + 1 // products + "See all results"
      : hasSearched
      ? 1 // empty state "See all results"
      : 0
    : 0;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll highlighted item into view if needed
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector(
        `[data-option-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = value.trim().slice(0, 60);
    if (trimmed.length < 2) {
      setProducts([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    const sanitized = sanitizeSearchQuery(trimmed);
    if (sanitized.length < 2) {
      setProducts([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    // Wait 250ms after the last keystroke (debounce)
    debounceTimerRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      setIsOpen(true);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, price, brand, images")
          .eq("is_active", true)
          .or(`name.ilike.%${sanitized}%,brand.ilike.%${sanitized}%`)
          .order("name")
          .limit(6);

        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (error) {
          // Handle errors silently (just hide the dropdown)
          setIsOpen(false);
          setProducts([]);
          setHasSearched(false);
        } else {
          setProducts(data || []);
          setHasSearched(true);
          setIsOpen(true);
        }
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setIsOpen(false);
          setProducts([]);
          setHasSearched(false);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 250);
  };

  const handleClear = () => {
    setQuery("");
    setProducts([]);
    setIsOpen(false);
    setIsLoading(false);
    setHasSearched(false);
    setHighlightedIndex(-1);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    const trimmed = query.trim().slice(0, 60);
    if (trimmed.length >= 2 && (products.length > 0 || hasSearched || isLoading)) {
      setIsOpen(true);
    }
  };

  const navigateToProduct = (slug: string) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectOrSubmit?.();
    router.push(`/product/${slug}`);
  };

  const navigateToShop = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectOrSubmit?.();
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    navigateToShop(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        const trimmed = query.trim().slice(0, 60);
        if (trimmed.length >= 2 && (products.length > 0 || hasSearched)) {
          setIsOpen(true);
        }
        return;
      }
      if (totalOptions === 0) return;
      setHighlightedIndex((prev) => (prev + 1 >= totalOptions ? 0 : prev + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        const trimmed = query.trim().slice(0, 60);
        if (trimmed.length >= 2 && (products.length > 0 || hasSearched)) {
          setIsOpen(true);
        }
        return;
      }
      if (totalOptions === 0) return;
      setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (products.length > 0) {
          if (highlightedIndex < products.length) {
            navigateToProduct(products[highlightedIndex].slug);
          } else {
            navigateToShop(query);
          }
        } else if (hasSearched && highlightedIndex === 0) {
          navigateToShop(query);
        }
      }
      // If nothing is highlighted, let form onSubmit execute naturally
    }
  };

  const trimmedQuery = query.trim();
  const activeDescendantId =
    isOpen && highlightedIndex >= 0
      ? `${dropdownId}-option-${highlightedIndex}`
      : undefined;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <form
        action="/shop"
        method="GET"
        onSubmit={handleSubmit}
        className="relative w-full"
      >
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search gadgets, laptops, audio..."
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dropdownId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-9 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isMobile ? "py-2.5" : "py-2"
          }`}
        />
        <Search
          className={`absolute left-3 h-4 w-4 text-gray-400 pointer-events-none ${
            isMobile ? "top-3" : "top-2.5"
          }`}
          aria-hidden="true"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isMobile ? "top-3" : "top-2.5"
            }`}
            aria-label="Clear search text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          id={dropdownId}
          ref={dropdownRef}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 top-full mt-2 w-full md:min-w-[360px] bg-white rounded-xl border border-gray-100 shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            /* Loading State: 3 small pulsing skeleton rows */
            <div
              className="p-2 space-y-2"
              aria-busy="true"
              aria-label="Loading suggestions"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-3.5 bg-gray-200 rounded w-14 shrink-0" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Results State */
            <div className="py-1.5">
              {products.map((product, index) => {
                const isHighlighted = highlightedIndex === index;
                const optionId = `${dropdownId}-option-${index}`;
                const firstImage =
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : null;

                return (
                  <Link
                    key={product.id}
                    id={optionId}
                    data-option-index={index}
                    role="option"
                    aria-selected={isHighlighted}
                    href={`/product/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setHighlightedIndex(-1);
                      onSelectOrSubmit?.();
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors border-b border-gray-50 last:border-0 ${
                      isHighlighted
                        ? "bg-blue-50/90 text-primary-dark"
                        : "hover:bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          isHighlighted
                            ? "font-semibold text-blue-900"
                            : "font-medium text-gray-900"
                        }`}
                      >
                        {product.name}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-gray-500 truncate">
                          {product.brand}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-xs sm:text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </div>
                  </Link>
                );
              })}

              {/* Last Row: See all results */}
              <Link
                id={`${dropdownId}-option-${products.length}`}
                data-option-index={products.length}
                role="option"
                aria-selected={highlightedIndex === products.length}
                href={`/shop?q=${encodeURIComponent(trimmedQuery)}`}
                onClick={() => {
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                  onSelectOrSubmit?.();
                }}
                onMouseEnter={() => setHighlightedIndex(products.length)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-primary border-t border-gray-100 transition-colors ${
                  highlightedIndex === products.length
                    ? "bg-blue-100/70 text-blue-900"
                    : "hover:bg-blue-50/70"
                }`}
              >
                <span className="truncate">
                  See all results for &ldquo;{trimmedQuery}&rdquo;
                </span>
                <Search className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
              </Link>
            </div>
          ) : hasSearched ? (
            /* Empty State */
            <div className="py-1.5">
              <div className="px-4 py-3 text-center text-xs sm:text-sm text-gray-500">
                No products found for &ldquo;{trimmedQuery}&rdquo;
              </div>
              <Link
                id={`${dropdownId}-option-0`}
                data-option-index={0}
                role="option"
                aria-selected={highlightedIndex === 0}
                href={`/shop?q=${encodeURIComponent(trimmedQuery)}`}
                onClick={() => {
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                  onSelectOrSubmit?.();
                }}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-primary border-t border-gray-100 transition-colors ${
                  highlightedIndex === 0
                    ? "bg-blue-100/70 text-blue-900"
                    : "hover:bg-blue-50/70"
                }`}
              >
                <span className="truncate">
                  See all results for &ldquo;{trimmedQuery}&rdquo;
                </span>
                <Search className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
