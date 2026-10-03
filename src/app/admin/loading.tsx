import { Spinner } from "@/components/admin/Spinner";

/** Shown while an admin page loads (opening an item to edit, changing a filter, switching section). */
export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-24 text-brand-700"
    >
      <Spinner className="size-8" />
      <span className="font-semibold">Cargando…</span>
    </div>
  );
}
