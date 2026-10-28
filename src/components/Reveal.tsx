"use client";

import { useRef } from "react";
import type { ElementType, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: ReactNode;
  /** Wrapper tag. Defaults to a <div>. Use "section", "ul", etc. to keep semantics. */
  as?: ElementType;
  className?: string;
  /** Vertical travel in px (the element starts this far below its place). */
  y?: number;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Animate the direct children one after another instead of the wrapper as a whole. */
  stagger?: boolean;
};

/**
 * Reveals its content with a gentle fade + slide as it scrolls into view, using GSAP's
 * ScrollTrigger. It is a client component, but the children are rendered on the server and
 * passed straight through, so the HTML (and SEO) is unaffected.
 *
 * The animation is set up inside useGSAP (a layout effect), so the start state is applied
 * before the browser paints — no flash of fully-visible content. If JavaScript never runs,
 * or the visitor prefers reduced motion, the content simply shows at rest.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 28,
  delay = 0,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Respect the visitor's motion preference: no animation, content stays put.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = stagger ? Array.from(el.children) : el;

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.8,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          // Play once when it first enters; leave it visible afterwards.
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
