"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isTerminal = currentStatus === "cancelled" || currentStatus === "delivered";

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      return;
    }

    if (selectedStatus === "cancelled") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order?\n\nThis will cancel the order and automatically restore all ordered item quantities back to product stock."
      );
      if (!confirmed) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateOrderStatusAction(orderId, selectedStatus);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Order status updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isTerminal || loading}
          className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button
          onClick={handleUpdate}
          disabled={isTerminal || loading || selectedStatus === currentStatus}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </Button>
      </div>

      {isTerminal && (
        <p className="text-xs text-gray-500 italic">
          This order is already marked as <span className="font-semibold">{currentStatus}</span> and cannot be modified.
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
