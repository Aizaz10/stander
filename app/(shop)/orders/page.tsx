import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track and review your past orders with Stander Trader.",
  robots: {
    index: false,
    follow: false,
  },
};

async function OrdersList() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-24 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-500 mb-8">You haven&apos;t placed any orders yet. Discover our collection of tech gadgets and accessories.</p>
        <Link href="/shop">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-none';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-none';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-none';
      case 'delivered': return 'bg-green-100 text-green-800 border-none';
      case 'cancelled': return 'bg-red-100 text-red-800 border-none';
      default: return 'bg-gray-100 text-gray-800 border-none';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const displayId = order.order_number || order.id.split('-')[0].toUpperCase();
        return (
          <Link key={order.id} href={`/orders/${order.id}`} className="block">
            <Card className="p-6 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold">Order #{displayId}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} • {order.order_items[0]?.count || 0} items
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-bold text-lg">{formatPrice(order.total)}</span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <Suspense fallback={<div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
