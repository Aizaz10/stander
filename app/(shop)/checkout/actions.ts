"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export async function placeOrderAction(items: { productId: string; quantity: number }[], formData: FormData) {
  try {
    await connection();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to place an order" };
    }

    if (!items || items.length === 0) {
      return { error: "Your cart is empty" };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;

    if (!name || !phone || !address || !city) {
      return { error: "Please fill in all shipping details" };
    }

    if (phone.length < 10) {
      return { error: "Phone number must be at least 10 digits" };
    }

    const payload = items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity
    }));

    const { data: orderId, error } = await supabase.rpc("place_order", {
      p_items: payload,
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city
    });

    if (error) {
      return { error: error.message };
    }

    return { orderId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return { error: message };
  }
}
