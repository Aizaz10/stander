"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateOrderStatusAction(orderId: string, status: string) {
  await connection();
  const supabase = await createClient();

  // 1. Verify caller is authenticated and an administrator
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: "Access denied. Administrator privileges required." };
  }

  // 2. Validate status argument
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return { error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}.` };
  }

  // 3. Call database function
  const { error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_status: status,
  });

  if (error) {
    return { error: error.message || "Failed to update order status." };
  }

  // 4. Revalidate cache for admin and customer order views
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}

export async function deleteOrder(orderId: string) {
  await connection();
  const supabase = await createClient();

  // 1. Verify caller is authenticated and an administrator
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Access denied. Administrator privileges required." };
  }

  // Pre-fetch order_number for the success redirect message
  const { data: orderData } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  const displayNum =
    orderData?.order_number || orderId.split("-")[0].toUpperCase();

  // 2. Call database function
  const { error } = await supabase.rpc("admin_delete_order", {
    p_order_id: orderId,
  });

  if (error) {
    let friendly = error.message || "Failed to delete order.";
    if (friendly.includes("Order not found")) {
      friendly = "Order not found or has already been deleted.";
    } else if (friendly.includes("Access denied")) {
      friendly = "Access denied. Administrator privileges required.";
    }
    return { error: friendly };
  }

  // 3. Revalidate cache for admin and customer order views
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/track-order");

  // 4. Redirect to /admin/orders with a success message
  redirect(`/admin/orders?deleted=${encodeURIComponent(displayNum)}`);
}

