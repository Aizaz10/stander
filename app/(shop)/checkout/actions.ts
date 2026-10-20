"use server";

import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import {
  normalizePkPhone,
  isValidEmail,
  trimAndCollapse,
  NAME_MAX,
  ADDRESS_MAX,
  CITY_MAX,
} from "@/lib/validation";

export interface PlaceOrderResult {
  orderId?: string;
  orderNumber?: number | null;
  isLoggedIn?: boolean;
  honeypot?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    email?: string;
  };
}

export async function placeOrderAction(
  items: { productId: string; quantity: number }[],
  formData: FormData
): Promise<PlaceOrderResult> {
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

    const fieldErrors: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      email?: string;
    } = {};

    const rawName = (formData.get("name") as string) || "";
    const rawPhone = (formData.get("phone") as string) || "";
    const rawAddress = (formData.get("address") as string) || "";
    const rawCity = (formData.get("city") as string) || "";
    const rawEmail = (formData.get("email") as string) || "";

    const name = trimAndCollapse(rawName);
    const address = trimAndCollapse(rawAddress);
    const city = trimAndCollapse(rawCity);
    const email = rawEmail.trim() || null;

    // Validate Full Name
    if (!name || name.length < 2) {
      fieldErrors.name = "Full name must be at least 2 characters";
    } else if (name.length > NAME_MAX) {
      fieldErrors.name = `Full name cannot exceed ${NAME_MAX} characters`;
    }

    // Validate Phone (normalized Pakistani mobile)
    const normalizedPhone = normalizePkPhone(rawPhone);
    if (!normalizedPhone) {
      fieldErrors.phone =
        "Enter a valid Pakistani mobile number (e.g. 0300 1234567)";
    }

    // Validate Address
    if (!address || address.length < 10) {
      fieldErrors.address = "Address must be at least 10 characters";
    } else if (address.length > ADDRESS_MAX) {
      fieldErrors.address = `Address cannot exceed ${ADDRESS_MAX} characters`;
    }

    // Validate City
    if (!city || city.length < 2) {
      fieldErrors.city = "Please select or enter your city";
    } else if (city.length > CITY_MAX) {
      fieldErrors.city = `City cannot exceed ${CITY_MAX} characters`;
    }

    // Validate Email (optional)
    if (email && !isValidEmail(email)) {
      fieldErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(fieldErrors).length > 0) {
      const firstErrorMessage = Object.values(fieldErrors)[0];
      return {
        error: firstErrorMessage,
        fieldErrors,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { data: result, error } = await supabase.rpc("place_order", {
      p_items: payload,
      p_name: name,
      p_phone: normalizedPhone,
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
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { error: message };
  }
}
