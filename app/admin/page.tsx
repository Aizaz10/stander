import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of sales, revenue, and order metrics for Stander store.",
};

async function DashboardContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'admin') {
    redirect("/");
  }

  // Fetch stats
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  
  // Calculate revenue (sum of totals of orders not cancelled)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .neq('status', 'cancelled');
    
  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 font-medium text-sm mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 font-medium text-sm mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold">{totalOrders || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Link href="/admin/orders?status=pending" className="block group">
          <Card className="p-6 transition-all duration-200 group-hover:shadow-md group-hover:border-primary/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1 group-hover:text-primary transition-colors">Pending Orders</p>
                <h3 className="text-3xl font-bold">{pendingOrders || 0}</h3>
              </div>
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 font-medium text-sm mb-1">Total Products</p>
              <h3 className="text-3xl font-bold">{totalProducts || 0}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary font-medium hover:underline text-sm">
            View All
          </Link>
        </div>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const shortId = order.id.split('-')[0].toUpperCase();
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                          <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                            #{shortId}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                            {order.shipping_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">${order.total?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline text-xs font-medium">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Dashboard</h1>
      <Suspense fallback={
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
