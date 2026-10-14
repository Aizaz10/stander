"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { trackOrderAction, type TrackOrderState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { 
  PackageSearch, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Check, 
  XCircle,
  Loader2
} from "lucide-react";

const initialState: TrackOrderState = {
  data: null,
  error: null,
};

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-none text-sm px-3 py-1">Pending</Badge>;
    case "confirmed":
      return <Badge className="bg-blue-100 text-blue-800 border-none text-sm px-3 py-1">Confirmed</Badge>;
    case "shipped":
      return <Badge className="bg-purple-100 text-purple-800 border-none text-sm px-3 py-1">Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-green-100 text-green-800 border-none text-sm px-3 py-1">Delivered</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 border-none text-sm px-3 py-1">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-none text-sm px-3 py-1">{status}</Badge>;
  }
}

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

export function TrackOrderForm() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") || "";

  const [state, formAction, isPending] = useActionState(trackOrderAction, initialState);

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "shipped": return 2;
      case "delivered": return 3;
      default: return -1;
    }
  };

  const currentStepIndex = state.data ? getStepIndex(state.data.status) : -1;
  const isCancelled = state.data?.status === "cancelled";

  return (
    <div className="space-y-8">
      {/* Lookup Form */}
      <Card className="p-6 sm:p-8">
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="orderNumber" className="text-sm font-medium text-gray-700">
                Order Number *
              </label>
              <Input
                id="orderNumber"
                name="orderNumber"
                type="number"
                required
                defaultValue={initialOrder}
                placeholder="e.g. 1001"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. 03001234567"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="lg" disabled={isPending} className="gap-2 w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Looking up...
                </>
              ) : (
                <>
                  <PackageSearch className="w-4 h-4" /> Track Order
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Error Message */}
      {state.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">
          {state.error}
        </div>
      )}

      {/* Result Card */}
      {state.data && (
        <div className="space-y-8">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-2xl font-bold font-mono text-gray-900">
                    Order #{state.data.order_number}
                  </h2>
                  {getStatusBadge(state.data.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Placed on {new Date(state.data.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs uppercase text-gray-500 font-semibold block">Order Total</span>
                <span className="text-2xl font-extrabold text-primary">
                  {formatPrice(state.data.total)}
                </span>
              </div>
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="py-8">
              {isCancelled ? (
                <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Order Cancelled</h3>
                    <p className="text-xs text-red-700 mt-0.5">
                      This order has been cancelled and is no longer being processed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden mb-2">
                    <div className="grid grid-cols-4 gap-2">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                                isCompleted
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-400"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                isCompleted ? "text-gray-900" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(12, ((currentStepIndex + 1) / 4) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Details
                </div>
                <p className="text-sm text-gray-800 font-medium">{state.data.shipping_name}</p>
                <p className="text-xs text-gray-600 mt-1">{state.data.shipping_address}</p>
                <p className="text-xs text-gray-600">{state.data.shipping_city}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-medium uppercase block mb-1">
                    Payment Method
                  </span>
                  <p className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</p>
                </div>
                <span className="text-xs text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-full self-start mt-2">
                  Pay on Arrival
                </span>
              </div>
            </div>
          </Card>

          {/* Ordered Items Table */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Ordered Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product Name</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                    <th className="px-6 py-3 font-medium text-center">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.data.items?.map((item, idx) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900 font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-base font-bold text-gray-700">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(state.data.total)}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
