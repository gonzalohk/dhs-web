const bobFormatter = new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" });

/** Formats a price in bolivianos, e.g. "Bs 120,00". */
export function formatBob(amount: number): string {
  return bobFormatter.format(amount);
}

/**
 * Normalizes a Bolivian phone number to E.164 (+591 followed by 8 digits).
 * Accepts "70000000", "591 70000000", "+591 7000-0000". Returns null when invalid.
 */
export function normalizeBoPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  const match = /^(?:\+?591)?(\d{8})$/.exec(digits);
  return match ? `+591${match[1]}` : null;
}

/** Formats an E.164 Bolivian number for display, e.g. "+591 7000 0000". */
export function formatBoPhone(e164: string): string {
  const local = e164.replace(/^\+591/, "");
  return `+591 ${local.slice(0, 4)} ${local.slice(4)}`;
}

/** Builds a WhatsApp click-to-chat link with a pre-filled message. */
export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
