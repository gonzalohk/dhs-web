"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";

// Layout effect on the client, plain effect on the server (avoids the SSR warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
 * Fades its content up as it scrolls into view, in the style of the Foody template's WOW.js
 * reveals — but with a tiny IntersectionObserver instead of a library. The start state is set
 * in a layout effect (before paint), so there is no flash; if JavaScript never runs, or the
 * visitor prefers reduced motion, the content simply shows at rest.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  y = 24,
  delay = 0,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = (stagger ? Array.from(el.children) : [el]) as HTMLElement[];

    // Hidden start state (applied before paint).
    items.forEach((node, i) => {
      node.style.opacity = "0";
      node.style.transform = `translateY(${y}px)`;
      node.style.transition = "opacity .7s ease, transform .7s ease";
      node.style.transitionDelay = `${delay + (stagger ? i * 0.12 : 0)}s`;
      node.style.willChange = "opacity, transform";
    });

    const reveal = () => {
      items.forEach((node) => {
        node.style.opacity = "1";
        node.style.transform = "none";
      });
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [y, delay, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
