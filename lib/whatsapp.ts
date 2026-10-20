import { WHATSAPP_NUMBER } from "./constants";

/**
 * Returns a wa.me direct link for the configured WhatsApp number.
 * If a message is provided, it is URL-encoded and appended as the text query param.
 */
export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message || !message.trim()) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Formats a raw international digits-only phone number into a readable string.
 * Example: "923001234567" -> "+92 300 1234567"
 * Falls back to "+" + raw digits if format is unknown.
 */
export function formatWhatsAppNumber(phone: string = WHATSAPP_NUMBER): string {
  const cleaned = phone.replace(/\D/g, "");
  // Formats Pakistan numbers: 92 (country code) + 3XX (mobile code) + XXXXXXX (subscriber number)
  if (cleaned.startsWith("92") && cleaned.length === 12) {
    return `+92 ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  return cleaned ? `+${cleaned}` : "";
}
