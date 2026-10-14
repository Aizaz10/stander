"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export async function placeOrderAction(
  items: { productId: string; quantity: number }[],
  formData: FormData
) {
  try {
    await connection();

    // Honeypot check: silently pretend success if filled by bots
    const honeypot = formData.get("company") as string;
    if (honeypot && honeypot.trim().length > 0) {
      return { orderNumber: 0, isLoggedIn: false, honeypot: true };
    }

    if (!items || items.length === 0) {
      return { error: "Your cart is empty" };
    }

    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const email = (formData.get("email") as string)?.trim() || null;

    if (!name || !phone || !address || !city) {
      return { error: "Please fill in all required shipping details" };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { error: "Phone number must be at least 10 digits" };
    }

    if (email && !email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { data: result, error } = await supabase.rpc("place_order", {
      p_items: payload,
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_email: email,
    });

    if (error) {
      let friendly = error.message;
      if (friendly.includes("Not enough stock")) {
        friendly = friendly.replace(/^.*(?:RAISE EXCEPTION|ERROR):\s*/i, "");
      } else if (friendly.includes("no longer available")) {
        friendly = "One or more products in your cart are no longer available.";
      }
      return { error: friendly };
    }

    const orderData = result as { id?: string; order_number?: number } | null;

    return {
      orderId: orderData?.id,
      orderNumber: orderData?.order_number ? Number(orderData.order_number) : null,
      isLoggedIn: !!user,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return { error: message };
  }
}
