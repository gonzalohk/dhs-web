"use client";

import { useEffect, useState } from "react";

/**
 * "Back to top" button (Foody template effect): fades in after scrolling down ~300px and smooth
 * scrolls to the top. Sits above the mobile WhatsApp button so they never overlap. Honours
 * reduced-motion by jumping instead of animating.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      className={`fixed right-4 bottom-24 z-40 flex size-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition-opacity duration-300 hover:bg-brand-800 md:right-6 md:bottom-6 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
        <path
          d="M6 15l6-6 6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
