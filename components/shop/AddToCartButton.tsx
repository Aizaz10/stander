"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    images?: string[];
    stock: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        stock: product.stock,
      },
      quantity
    );

    setAdded(true);
    setQuantity(1);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Quantity Stepper */}
      <div className="w-32 shrink-0 h-12 px-2 flex items-center justify-between border border-gray-200 rounded-xl bg-gray-50">
        <button
          type="button"
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          disabled={isOutOfStock || quantity <= 1}
          aria-label="Decrease quantity"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-semibold text-gray-900 tabular-nums select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
          disabled={isOutOfStock || quantity >= stock}
          aria-label="Increase quantity"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-light hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Button 
        size="lg" 
        className="flex-1 h-12" 
        onClick={handleAdd}
        disabled={isOutOfStock || added}
        variant={added ? "secondary" : "primary"}
      >
        {isOutOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
      </Button>
    </div>
  );
}

