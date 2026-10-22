/**
 * Delivery Fee Constants & Helpers
 * Note: These values are for client-side UI calculation and display only.
 * The database function (place_order RPC) is the authoritative source of truth.
 */

export const SHIPPING_FEE_KARACHI = 250;
export const SHIPPING_FEE_OTHER = 350;

export const WHATSAPP_NUMBER = "923222352516"; 
export const SUPPORT_HOURS = "Monday to Saturday, 10:00 AM to 8:00 PM"; // TODO: replace with the real support hours

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Hyderabad",
  "Peshawar",
  "Quetta",
] as const;

export type PakistanCity = (typeof PAKISTAN_CITIES)[number];

/**
 * Returns the estimated shipping fee for a given city:
 * - Empty / unselected: 0
 * - Karachi: Rs. 250
 * - Any other city: Rs. 350
 */
export function getShippingFee(city: string | null | undefined): number {
  if (!city || !city.trim()) {
    return 0;
  }
  return city.trim().toLowerCase() === "karachi"
    ? SHIPPING_FEE_KARACHI
    : SHIPPING_FEE_OTHER;
}
