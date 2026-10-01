import { inquirySchema, type InquiryField, type InquiryInput } from "./schema";

// Contact form processing, independent of Next.js so it can be unit tested.
// See specs/001-food-distribution-website/contracts/contact-form.md.

export const RATE_LIMIT_PER_HOUR = 5;
export const MIN_FILL_TIME_MS = 3000;

export type InquiryResult =
  | { ok: true }
  | {
      ok: false;
      errors?: Partial<Record<InquiryField, string>>;
      formError?: string;
      values?: Record<string, string>;
    };

export type InquiryDeps = {
  /** Number of inquiries from this hashed IP in the last hour. */
  countRecent: (ipHash: string) => Promise<number>;
  store: (input: InquiryInput, ipHash: string) => Promise<{ id: string }>;
  sendEmail: (input: InquiryInput) => Promise<void>;
  markEmailSent: (id: string) => Promise<void>;
};

const FIELDS: InquiryField[] = ["name", "email", "phone", "businessName", "message"];

export async function processInquiry(
  raw: Record<string, string>,
  ipHash: string,
  deps: InquiryDeps,
  now = Date.now(),
): Promise<InquiryResult> {
  // Spam signals: filled honeypot or a form submitted too fast. Pretend success, store nothing.
  const startedAt = Number(raw.startedAt);
  if (raw.website || (startedAt > 0 && now - startedAt < MIN_FILL_TIME_MS)) return { ok: true };

  const values = Object.fromEntries(FIELDS.map((f) => [f, raw[f] ?? ""]));
  const parsed = inquirySchema.safeParse(values);
  if (!parsed.success) {
    const errors: Partial<Record<InquiryField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as InquiryField;
      errors[field] ??= issue.message;
    }
    return { ok: false, errors, values };
  }

  try {
    if ((await deps.countRecent(ipHash)) >= RATE_LIMIT_PER_HOUR) {
      return {
        ok: false,
        formError:
          "Recibimos varios mensajes suyos en la última hora. Por favor escríbanos por WhatsApp o llámenos.",
        values,
      };
    }
    const { id } = await deps.store(parsed.data, ipHash);
    try {
      await deps.sendEmail(parsed.data);
      await deps.markEmailSent(id);
    } catch (error) {
      // The inquiry is stored and visible in the staff area, so the visitor still gets success.
      console.error("Inquiry stored but email failed", error);
    }
    return { ok: true };
  } catch (error) {
    console.error("Inquiry could not be stored", error);
    return {
      ok: false,
      formError:
        "No pudimos enviar su mensaje. Inténtelo de nuevo o escríbanos por WhatsApp o llámenos.",
      values,
    };
  }
}
