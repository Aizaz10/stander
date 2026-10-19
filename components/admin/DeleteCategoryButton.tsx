"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteCategoryAction } from "@/app/admin/categories/actions";
import { useState } from "react";

interface DeleteCategoryButtonProps {
  id: string;
  name: string;
  productCount?: number;
}

export function DeleteCategoryButton({
  id,
  name,
  productCount = 0,
}: DeleteCategoryButtonProps) {
  const [loading, setLoading] = useState(false);
  const hasProducts = productCount > 0;

  const handleDelete = async () => {
    if (hasProducts) {
      alert(
        `This category has ${productCount} product${
          productCount > 1 ? "s" : ""
        }. Move or delete those products first.`
      );
      return;
    }

    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setLoading(true);
      const res = await deleteCategoryAction(id);
      if (res?.error) {
        alert(res.error);
        setLoading(false);
      }
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={loading}
      title={
        hasProducts
          ? `This category has ${productCount} product${
              productCount > 1 ? "s" : ""
            }. Move or delete those products first.`
          : `Delete ${name}`
      }
      className={
        hasProducts
          ? "text-gray-300 hover:text-gray-400"
          : "text-gray-500 hover:text-red-600 hover:bg-red-50"
      }
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
