import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { OrderFilters, OrderFiltersSkeleton } from "@/components/admin/OrderFilters";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders Management",
  description: "View and manage customer orders and fulfillment statuses.",
};

interface OrdersSearchParams {
  status?: string;
  q?: string;
  page?: string;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-none">Pending</Badge>;
    case "confirmed":
      return <Badge className="bg-blue-100 text-blue-800 border-none">Confirmed</Badge>;
    case "shipped":
      return <Badge className="bg-purple-100 text-purple-800 border-none">Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-green-100 text-green-800 border-none">Delivered</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 border-none">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-none">{status}</Badge>;
  }
}

async function OrdersList({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<OrdersSearchParams>;
}) {
  await connection();
  const supabase = await createClient();
  const searchParams = await searchParamsPromise;

  // 1. Verify admin permissions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // 2. Build query
  const status = searchParams.status;
  const q = searchParams.q?.trim();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const limit = 15;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select("*, order_items(quantity)", { count: "exact" });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
    const isNumber = /^\d+$/.test(q);
    if (isUuid) {
      query = query.or(`id.eq.${q},shipping_name.ilike.%${q}%`);
    } else if (isNumber) {
      query = query.or(`order_number.eq.${q},shipping_name.ilike.%${q}%`);
    } else {
      query = query.ilike("shipping_name", `%${q}%`);
    }
  }

  const { data: orders, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">City</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders && orders.length > 0 ? (
                orders.map((order) => {
                  const shortId = order.id.split("-")[0].toUpperCase();
                  const displayId = order.order_number || shortId;
                  const itemsCount =
                    order.order_items?.reduce(
                      (sum: number, it: { quantity?: number }) => sum + (it.quantity || 1),
                      0
                    ) ?? 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-900">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          #{displayId}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{order.shipping_name}</span>
                          {!order.user_id && (
                            <Badge className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 border-none">
                              Guest
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.shipping_phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.shipping_city || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {itemsCount} {itemsCount === 1 ? "item" : "items"}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} orders
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const params = new URLSearchParams();
              if (status && status !== "all") params.set("status", status);
              if (q) params.set("q", q);
              params.set("page", pageNum.toString());

              return (
                <Link key={pageNum} href={`/admin/orders?${params.toString()}`}>
                  <Button
                    size="sm"
                    variant={pageNum === page ? "primary" : "outline"}
                    className="w-9 h-9 p-0"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<OrdersSearchParams>;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage, track and update store customer orders.
        </p>
      </div>

      <Suspense fallback={<OrderFiltersSkeleton />}>
        <OrderFilters />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <OrdersList searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
