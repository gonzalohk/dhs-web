import { describe, expect, it, vi } from "vitest";
import { processInquiry, RATE_LIMIT_PER_HOUR, type InquiryDeps } from "@/lib/inquiry";

const NOW = 1_000_000;
const form = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "",
  businessName: "",
  message: "Quisiera una cotización semanal de verduras.",
  website: "",
  startedAt: String(NOW - 10_000),
};

function deps(overrides: Partial<InquiryDeps> = {}): InquiryDeps {
  return {
    countRecent: vi.fn(async () => 0),
    store: vi.fn(async () => ({ id: "inq-1" })),
    sendEmail: vi.fn(async () => {}),
    markEmailSent: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("processInquiry", () => {
  it("stores, emails and marks the email as sent on success", async () => {
    const d = deps();
    expect(await processInquiry(form, "hash", d, NOW)).toEqual({ ok: true });
    expect(d.store).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana Pérez" }), "hash");
    expect(d.sendEmail).toHaveBeenCalled();
    expect(d.markEmailSent).toHaveBeenCalledWith("inq-1");
  });

  it("returns per-field errors and preserves input on invalid data", async () => {
    const d = deps();
    const result = await processInquiry({ ...form, message: "Hola" }, "hash", d, NOW);
    expect(result).toMatchObject({ ok: false, errors: { message: expect.any(String) } });
    if (!result.ok) expect(result.values?.name).toBe("Ana Pérez");
    expect(d.store).not.toHaveBeenCalled();
  });

  it("silently ignores a filled honeypot", async () => {
    const d = deps();
    expect(await processInquiry({ ...form, website: "http://spam" }, "hash", d, NOW)).toEqual({
      ok: true,
    });
    expect(d.store).not.toHaveBeenCalled();
  });

  it("silently ignores forms submitted faster than 3 seconds", async () => {
    const d = deps();
    const fast = { ...form, startedAt: String(NOW - 1000) };
    expect(await processInquiry(fast, "hash", d, NOW)).toEqual({ ok: true });
    expect(d.store).not.toHaveBeenCalled();
  });

  it(`rate limits after ${RATE_LIMIT_PER_HOUR} inquiries per hour per IP`, async () => {
    const d = deps({ countRecent: vi.fn(async () => RATE_LIMIT_PER_HOUR) });
    const result = await processInquiry(form, "hash", d, NOW);
    expect(result).toMatchObject({ ok: false, formError: expect.stringMatching(/WhatsApp/) });
    expect(d.store).not.toHaveBeenCalled();
  });

  it("still succeeds when the email fails after the inquiry is stored", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const d = deps({ sendEmail: vi.fn(async () => Promise.reject(new Error("down"))) });
    expect(await processInquiry(form, "hash", d, NOW)).toEqual({ ok: true });
    expect(d.markEmailSent).not.toHaveBeenCalled();
  });

  it("returns a form error with a WhatsApp fallback when storing fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const d = deps({ store: vi.fn(async () => Promise.reject(new Error("db down"))) });
    const result = await processInquiry(form, "hash", d, NOW);
    expect(result).toMatchObject({ ok: false, formError: expect.stringMatching(/WhatsApp/) });
  });
});
