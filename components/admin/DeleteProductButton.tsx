"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteProductAction } from "@/app/admin/products/actions";
import { useState } from "react";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setLoading(true);
      const res = await deleteProductAction(id);
      if (res?.error) {
        alert(res.error);
        setLoading(false);
      }
    }
  };

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
