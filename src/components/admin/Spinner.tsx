/** Loading spinner (decorative; always paired with visible or screen-reader text). */
export function Spinner({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`${className} animate-spin motion-reduce:animate-pulse`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Full-screen "working" layer shown while an admin change is being saved. It blocks clicks, so the same
 * action cannot be sent twice, and tells screen readers that something is happening.
 */
export function BusyOverlay({ label = "Guardando cambios…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-[1px]"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-brand-800 shadow-xl ring-1 ring-brand-100">
        <Spinner className="size-7 text-brand-600" />
        <span className="font-semibold">{label}</span>
      </div>
    </div>
  );
}
