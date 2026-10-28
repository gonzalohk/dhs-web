"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Drifts its children downward as the page scrolls, for a gentle parallax. Meant to wrap a
 * fill image inside an `overflow-hidden` section; keep the wrapper taller than the section
 * (e.g. -top-[14%] h-[128%]) so the drift never exposes an edge. No-op under reduced motion.
 */
export function Parallax({
  children,
  className,
  to = 10,
}: {
  children: ReactNode;
  className?: string;
  /** How far the content drifts, in percent of its own height, across the scroll. */
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(el, {
        yPercent: to,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
