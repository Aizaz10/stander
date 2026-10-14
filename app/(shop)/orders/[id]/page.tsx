import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await connection();
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("orders").select("order_number").eq("id", id).single();
    const displayId = data?.order_number || id.split("-")[0].toUpperCase();
    return {
      title: `Order #${displayId}`,
      description: `Details and tracking for order #${displayId}.`,
    };
  } catch {
    const shortId = id.split("-")[0].toUpperCase();
    return {
      title: `Order #${shortId}`,
      description: `Details and tracking for order #${shortId}.`,
    };
  }
}

async function OrderDetails({ 
  orderId, 
  showPlacedBanner 
}: { 
  orderId: string;
  showPlacedBanner: boolean;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    notFound();
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

  const shortId = order.id.split('-')[0].toUpperCase();
  const displayId = order.order_number || shortId;

  return (
    <div className="space-y-8">
      {showPlacedBanner && (
        <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 text-center font-medium">
          Order placed successfully! We will contact you soon.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Order #{displayId}</h2>
          <p className="text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge className={getStatusColor(order.status) + " text-base px-4 py-1"}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Shipping Details</h3>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium text-gray-900">Name:</span> {order.shipping_name}</p>
            <p><span className="font-medium text-gray-900">Phone:</span> {order.shipping_phone}</p>
            <p><span className="font-medium text-gray-900">Address:</span> {order.shipping_address}</p>
            <p><span className="font-medium text-gray-900">City:</span> {order.shipping_city}</p>
            <p><span className="font-medium text-gray-900">Payment:</span> Cash on Delivery</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold">Order Items</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {order.order_items.map((item: OrderItem) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-left sm:text-right font-medium">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-100">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-2xl">{formatPrice(order.total)}</span>
        </div>
      </Card>
    </div>
  );
}

export default function OrderPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />}>
        <OrderDetailsWrapper paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}

async function OrderDetailsWrapper({ 
  paramsPromise, 
  searchParamsPromise 
}: { 
  paramsPromise: Promise<{ id: string }>;
  searchParamsPromise: Promise<{ placed?: string }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  
  return <OrderDetails orderId={params.id} showPlacedBanner={searchParams.placed === '1'} />;
}
