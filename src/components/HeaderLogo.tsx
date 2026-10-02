"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import logoHeader from "@/assets/brand/logo-header.png";

/**
 * The header logo mark. The company name is shown as text only when the image fails to load, so the header
 * stays clean in the normal case and never ends up empty.
 */
export function HeaderLogo({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image may fail before React attaches onError (server-rendered HTML), so check it after mounting too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <span className="truncate">{name}</span>;
  return (
    <Image
      ref={ref}
      src={logoHeader}
      alt=""
      priority
      onError={() => setFailed(true)}
      className="h-11 w-auto shrink-0"
    />
  );
}
