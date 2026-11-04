"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen loading spinner: a DHS cargo container that gently floats up and down while the
 * page loads, then fades out once it is ready. A pure-CSS fallback also hides it after a few
 * seconds, so it never traps the page if JavaScript stalls.
 */
export function Spinner() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hide = () => setDone(true);
    if (document.readyState === "complete") {
      const t = setTimeout(hide, 350);
      return () => clearTimeout(t);
    }
    const onLoad = () => setTimeout(hide, 300);
    window.addEventListener("load", onLoad);
    const safety = setTimeout(hide, 2500);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(safety);
    };
  }, []);

  return (
    <div className={`loco-overlay ${done ? "loco-overlay--hidden" : ""}`} aria-hidden="true">
      <div className="loco-scene">
        <svg viewBox="0 0 260 180" className="loco-svg" role="img" aria-label="Cargando">
          {/* Floor shadow (shrinks as the container lifts) */}
          <ellipse className="box-shadow" cx="130" cy="156" rx="78" ry="9" fill="#c3ccda" />

          {/* Container floats up and down */}
          <g className="box-bob">
            {/* Outer frame */}
            <rect x="34" y="44" width="192" height="96" rx="7" fill="#304159" />
            {/* Body */}
            <rect x="42" y="54" width="176" height="76" rx="3" fill="#ef8f21" />
            {/* Corrugation */}
            <g stroke="#c9771a" strokeWidth="3">
              <line x1="56" y1="58" x2="56" y2="126" />
              <line x1="70" y1="58" x2="70" y2="126" />
              <line x1="84" y1="58" x2="84" y2="126" />
              <line x1="176" y1="58" x2="176" y2="126" />
              <line x1="190" y1="58" x2="190" y2="126" />
              <line x1="204" y1="58" x2="204" y2="126" />
            </g>
            {/* Top & bottom rails */}
            <rect x="42" y="54" width="176" height="9" rx="2" fill="#243247" />
            <rect x="42" y="121" width="176" height="9" rx="2" fill="#243247" />
            {/* Corner castings */}
            <rect x="34" y="44" width="15" height="15" rx="2" fill="#243247" />
            <rect x="211" y="44" width="15" height="15" rx="2" fill="#243247" />
            <rect x="34" y="125" width="15" height="15" rx="2" fill="#243247" />
            <rect x="211" y="125" width="15" height="15" rx="2" fill="#243247" />
            {/* Label */}
            <text
              x="130"
              y="103"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="36"
              fontWeight="700"
              fill="#ffffff"
            >
              DHS
            </text>
          </g>
        </svg>
        <p className="loco-text">Cargando…</p>
      </div>
    </div>
  );
}
