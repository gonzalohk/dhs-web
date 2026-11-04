"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Foody-style navbar effect. On interior pages the header shares the light colour of the
 * page-header band. On the home page it is transparent at the top so the hero photo shows
 * through and the navbar fuses with it; once scrolled (anywhere) it becomes a solid white bar
 * with a shadow. Sets `data-home` and `data-scrolled` on the nearest <header>; the look lives in
 * .site-header CSS, so the Header can stay a server component. Renders nothing.
 */
export function HeaderShadow() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    header.dataset.home = pathname === "/" ? "true" : "false";
    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 40 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
