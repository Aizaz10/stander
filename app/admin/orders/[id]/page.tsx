import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, MapPin, CreditCard, Calendar, Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const shortId = id.split("-")[0].toUpperCase();
  return {
    title: `Order #${shortId}`,
    description: `Admin order management for #${shortId}.`,
  };
}

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

async function OrderDetailContent({ id }: { id: string }) {
  await connection();
  const supabase = await createClient();

  // 1. Verify admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // 2. Fetch order with order_items
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const shortId = order.id.split("-")[0].toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-mono text-gray-900">
              Order #{shortId}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Placed on {new Date(order.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Update Status Control */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:w-80">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Change Order Status
          </p>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Ordered Items
              </h2>
              <span className="text-sm text-gray-500">
                {order.order_items?.length || 0} line {order.order_items?.length === 1 ? "item" : "items"}
              </span>
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
                  {order.order_items?.map((item: OrderItem) => {
                    const lineTotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
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

            {/* Total Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-base font-bold text-gray-700">Order Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(order.total)}
              </span>
            </div>
          </Card>
        </div>

        {/* Shipping & Payment Details */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Shipping Details
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Recipient</p>
                    <p className="font-semibold text-gray-900">{order.shipping_name || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Phone</p>
                    <p className="font-medium text-gray-900">{order.shipping_phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Delivery Address</p>
                    <p className="text-gray-900">{order.shipping_address || "-"}</p>
                    <p className="text-gray-900 font-medium">{order.shipping_city || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">
                  {order.payment_method?.toUpperCase() === "COD"
                    ? "Cash on Delivery (COD)"
                    : order.payment_method || "Cash on Delivery"}
                </span>
                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                  Pay on Arrival
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function OrderDetailContentWrapper({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  return <OrderDetailContent id={params.id} />;
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <OrderDetailContentWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}
