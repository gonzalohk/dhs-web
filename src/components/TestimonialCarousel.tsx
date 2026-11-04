"use client";

import { useCallback, useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";

/**
 * Testimonials as a Foody-style carousel: one highlighted card at a time, auto-advancing, with
 * round prev/next controls. Every testimonial stays rendered as a <figure> inside the
 * data-testid="testimonials" container (the e2e test counts them). Autoplay pauses for visitors
 * who prefer reduced motion.
 */
export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const count = testimonials.length;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(id);
  }, [count]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="overflow-hidden" data-testid="testimonials">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {testimonials.map((t) => (
            <figure key={t.id} className="w-full shrink-0 px-2">
              <div className="rounded-2xl bg-brand-700 px-6 py-8 text-center text-white shadow-[0_0_45px_rgba(0,0,0,0.1)]">
                <span aria-hidden className="font-display text-5xl leading-none text-accent-400">
                  “
                </span>
                <blockquote className="mt-2 text-lg italic">{t.quote}</blockquote>
                <figcaption className="mt-4 font-semibold text-accent-400">— {t.author}</figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Testimonio anterior"
            className="flex size-11 items-center justify-center rounded-full border-2 border-brand-700 text-brand-700 transition-colors hover:bg-brand-700 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <ul className="flex gap-2">
            {testimonials.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir al testimonio ${i + 1}`}
                  aria-current={i === index}
                  className={`block size-2.5 rounded-full transition-colors ${
                    i === index ? "bg-accent-500" : "bg-brand-200"
                  }`}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente testimonio"
            className="flex size-11 items-center justify-center rounded-full border-2 border-brand-700 text-brand-700 transition-colors hover:bg-brand-700 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
