"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";

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
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div className="flex gap-4">
      <div className="w-24 shrink-0">
        <select 
          className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-gray-50 outline-none" 
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={isOutOfStock}
        >
          {Array.from({ length: Math.min(10, Math.max(1, stock)) }).map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <Button 
        size="lg" 
        className="flex-1" 
        onClick={handleAdd}
        disabled={isOutOfStock || added}
        variant={added ? "secondary" : "primary"}
      >
        {isOutOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
      </Button>
    </div>
  );
}
