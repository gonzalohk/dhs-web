import { whatsappLink } from "@/lib/format";
import { ChatIcon } from "./icons";

type Props = {
  phone: string;
  message: string;
  label?: string;
  variant?: "solid" | "outline" | "light";
  className?: string;
};

/** WhatsApp click-to-chat link styled as a button (the site's primary contact action). */
export function WhatsAppButton({
  phone,
  message,
  label = "Escríbanos por WhatsApp",
  variant = "solid",
  className = "",
}: Props) {
  const style = {
    solid: "bg-whatsapp text-white hover:bg-brand-800",
    outline: "border-2 border-whatsapp text-whatsapp hover:bg-brand-50",
    light: "bg-white text-brand-800 hover:bg-brand-50",
  }[variant];
  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors ${style} ${className}`}
    >
      <ChatIcon />
      {label}
    </a>
  );
}

/** Persistent WhatsApp button fixed to the bottom of the screen on mobile. */
export function StickyWhatsApp({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappLink(phone, "Hola, quisiera información sobre sus productos.")}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="sticky-whatsapp"
      className="fixed right-4 bottom-4 z-40 inline-flex min-h-14 items-center gap-2 rounded-full bg-whatsapp px-5 font-semibold text-white shadow-lg hover:bg-brand-800 md:hidden"
    >
      <ChatIcon className="size-6" />
      WhatsApp
    </a>
  );
}
