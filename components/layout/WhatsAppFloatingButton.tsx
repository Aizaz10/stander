import { getWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/shop/WhatsAppIcon";

export function WhatsAppFloatingButton() {
  const href = getWhatsAppLink("Hi Stander Trader! I have a question.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7 text-white" />
    </a>
  );
}
