/**
 * Shared validation helpers and constraints.
 * No hooks, safe for use in Server Actions, API routes, and Client Components.
 */

export const NAME_MAX = 100;
export const ADDRESS_MAX = 300;
export const CITY_MAX = 60;
export const EMAIL_MAX = 254;

export const PRODUCT_NAME_MAX = 150;
export const PRODUCT_SLUG_MAX = 160;
export const PRODUCT_BRAND_MAX = 60;
export const PRODUCT_DESCRIPTION_MAX = 3000;
export const PRODUCT_PRICE_MAX = 100_000_000; // below 100,000,000
export const PRODUCT_STOCK_MAX = 1_000_000; // whole number between 0 and 1,000,000
export const CATEGORY_NAME_MAX = 60;
export const CATEGORY_SLUG_MAX = 80;

/**
 * Trims leading/trailing whitespace and collapses repeated internal spaces into a single space.
 */
export function trimAndCollapse(input: string | null | undefined): string {
  if (!input) return "";
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a Pakistani mobile number into the canonical 11-digit format: 03XXXXXXXXX.
 * Strips all non-digit characters.
 * Handles:
 * - 0092XXXXXXXXXX (14 digits) -> 0XXXXXXXXXX
 * - 92XXXXXXXXXX (12 digits) -> 0XXXXXXXXXX
 * - 3XXXXXXXXX (10 digits starting with 3) -> 03XXXXXXXXX
 * - 03XXXXXXXXX (11 digits starting with 03) -> 03XXXXXXXXX
 * Returns the normalized 11-digit string if valid (/^03\d{9}$/), or null otherwise.
 */
export function normalizePkPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("0092") && digits.length === 14) {
    digits = "0" + digits.slice(-10);
  } else if (digits.startsWith("92") && digits.length === 12) {
    digits = "0" + digits.slice(-10);
  } else if (digits.startsWith("3") && digits.length === 10) {
    digits = "0" + digits;
  }

  if (/^03\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

/**
 * Validates an email address using a sensible regex (local@domain.tld, no spaces, max 254 chars).
 */
export function isValidEmail(input: string | null | undefined): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > EMAIL_MAX) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}
