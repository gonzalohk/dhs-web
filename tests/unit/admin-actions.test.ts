import { describe, expect, it, vi } from "vitest";
import { changeInquiryStatus } from "@/lib/admin";

const NOW = new Date("2026-09-30T12:00:00Z");

describe("changeInquiryStatus", () => {
  it("fails without a signed-in staff member", async () => {
    const update = vi.fn();
    const result = await changeInquiryStatus(
      { getUserId: async () => null, update },
      "i1",
      "handled",
      NOW,
    );
    expect(result).toEqual({ ok: false, error: "unauthorized" });
    expect(update).not.toHaveBeenCalled();
  });

  it("marks handled with time and staff id", async () => {
    const update = vi.fn(async () => {});
    await changeInquiryStatus({ getUserId: async () => "u1", update }, "i1", "handled", NOW);
    expect(update).toHaveBeenCalledWith("i1", {
      status: "handled",
      handled_at: NOW.toISOString(),
      handled_by: "u1",
    });
  });

  it("reopens as new and clears handled fields", async () => {
    const update = vi.fn(async () => {});
    await changeInquiryStatus({ getUserId: async () => "u1", update }, "i1", "new", NOW);
    expect(update).toHaveBeenCalledWith("i1", {
      status: "new",
      handled_at: null,
      handled_by: null,
    });
  });

  it("rejects unknown statuses", async () => {
    const update = vi.fn();
    const result = await changeInquiryStatus(
      { getUserId: async () => "u1", update },
      "i1",
      "spam",
      NOW,
    );
    expect(result).toEqual({ ok: false, error: "invalid" });
    expect(update).not.toHaveBeenCalled();
  });
});
