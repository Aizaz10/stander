"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export interface TrackedOrderItem {
  product_name: string;
  price: number;
  quantity: number;
}

export interface TrackedOrder {
  order_number: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  items: TrackedOrderItem[];
}

export interface TrackOrderState {
  data: TrackedOrder | null;
  error: string | null;
}

export async function trackOrderAction(
  prevState: TrackOrderState,
  formData: FormData
): Promise<TrackOrderState> {
  await connection();

  const orderNumberRaw = formData.get("orderNumber") as string;
  const phoneRaw = formData.get("phone") as string;

  const orderNumber = parseInt(orderNumberRaw?.trim() || "", 10);
  const phone = phoneRaw?.trim() || "";

  if (!orderNumber || isNaN(orderNumber) || orderNumber <= 0) {
    return {
      error: "Please enter a valid order number.",
      data: null,
    };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return {
      error: "Please enter a valid phone number with at least 10 digits.",
      data: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: orderNumber,
    p_phone: phone,
  });

  if (error || !data) {
    return {
      error: "Order not found. Please check your order number and phone number.",
      data: null,
    };
  }

  return {
    data: data as TrackedOrder,
    error: null,
  };
}
