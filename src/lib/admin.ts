import type { InquiryStatus } from "./types";

// Inquiry status changes, independent of Next.js so they can be unit tested.

type StatusPatch = { status: InquiryStatus; handled_at: string | null; handled_by: string | null };

export type StatusDeps = {
  getUserId: () => Promise<string | null>;
  update: (id: string, patch: StatusPatch) => Promise<void>;
};

export async function changeInquiryStatus(
  deps: StatusDeps,
  id: string,
  status: string,
  now = new Date(),
): Promise<{ ok: true } | { ok: false; error: "unauthorized" | "invalid" }> {
  const userId = await deps.getUserId();
  if (!userId) return { ok: false, error: "unauthorized" };
  if (status !== "new" && status !== "handled") return { ok: false, error: "invalid" };
  const patch: StatusPatch =
    status === "handled"
      ? { status, handled_at: now.toISOString(), handled_by: userId }
      : { status, handled_at: null, handled_by: null };
  await deps.update(id, patch);
  return { ok: true };
}
