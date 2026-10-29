"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Trash2, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { deleteOrder } from "@/app/admin/orders/actions";

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string | number;
  status: string;
  variant?: "outline" | "icon";
}

export function DeleteOrderButton({
  orderId,
  orderNumber,
  status,
  variant = "outline",
}: DeleteOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open & handle Escape
  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending]);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteOrder(orderId);
        if (res?.error) {
          setError(res.error);
        }
      } catch (err: unknown) {
        // Next.js redirect throws a digest starting with NEXT_REDIRECT
        const digest = (err as { digest?: string })?.digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Failed to delete order");
      }
    });
  };

  const isRestorableStatus =
    status === "pending" || status === "confirmed" || status === "shipped";
  const isDelivered = status === "delivered";

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          disabled={isPending}
          aria-label={`Delete order #${orderNumber}`}
          title={`Delete order #${orderNumber}`}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete order</span>
        </button>
      )}

      {/* Confirmation Dialog Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-order-dialog-title"
          aria-describedby="delete-order-dialog-description"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => {
            if (!isPending) setIsOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2
                id="delete-order-dialog-title"
                className="text-lg font-bold text-gray-900"
              >
                Delete order #{orderNumber}?
              </h2>
              <p
                id="delete-order-dialog-description"
                className="text-sm text-gray-600 mt-1.5"
              >
                This permanently removes the order and its items. This cannot be
                undone.
              </p>
            </div>

            {/* Status-specific warning note */}
            {isRestorableStatus && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>The reserved stock will be added back to the products.</span>
              </div>
            )}

            {isDelivered && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This order was delivered. Deleting it removes this sale from
                  revenue and from your records.
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Dialog Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl font-medium px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
