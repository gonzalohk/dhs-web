"use client";

import type { ReactNode } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { formatBoPhone, normalizeBoPhone } from "@/lib/format";
import { renderText } from "@/lib/tokens";
import type { Category, Product, Settings } from "@/lib/types";
import { useEditor } from "./EditorForm";

type Props =
  | { kind: "product"; whatsappNumber: string }
  | { kind: "category" }
  | { kind: "faq" }
  | { kind: "testimonial" }
  | { kind: "text"; settings: Settings }
  | { kind: "company" };

function Frame({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Vista previa"
      className="rounded-2xl border-2 border-dashed border-brand-100 p-4"
    >
      <p className="mb-3 text-sm font-semibold text-brand-700">
        Vista previa (aún no está publicada)
      </p>
      <div className="pointer-events-none max-w-md">{children}</div>
    </aside>
  );
}

/** Shows the public components with the values typed so far. It never saves anything. */
export function PreviewPanel(props: Props) {
  const { values: v } = useEditor();

  switch (props.kind) {
    case "product": {
      const price = v.priceBob ? Number(v.priceBob) : null;
      const product: Product = {
        id: "preview",
        categoryId: v.categoryId ?? "",
        name: v.name || "Nombre del producto",
        description: v.description || "Descripción del producto",
        priceBob: price !== null && price > 0 ? price : null,
        unit: v.unit || null,
        imagePath: v.imagePath || null,
        imageSrc: v.imageSrc || null,
        imageAlt: v.imageAlt ?? "",
      };
      return (
        <Frame>
          <ProductCard
            product={product}
            fallbackImage={null}
            whatsappNumber={props.whatsappNumber}
          />
        </Frame>
      );
    }
    case "category": {
      const category: Category = {
        id: "preview",
        slug: v.slug || "categoria",
        name: v.name || "Nombre de la categoría",
        description: v.description || "Descripción de la categoría",
        imagePath: v.imagePath || null,
        imageSrc: v.imageSrc || null,
        imageAlt: v.imageAlt ?? "",
      };
      return (
        <Frame>
          <CategoryCard category={category} headingLevel="h3" />
        </Frame>
      );
    }
    case "faq":
      return (
        <Frame>
          <details open className="rounded-2xl border border-brand-100 p-4">
            <summary className="font-medium">{v.question || "Pregunta"}</summary>
            <p className="mt-2 text-muted">{v.answer || "Respuesta"}</p>
          </details>
        </Frame>
      );
    case "testimonial":
      return (
        <Frame>
          <figure className="rounded-2xl border border-brand-100 bg-white p-5">
            <blockquote className="text-ink">“{v.quote || "Testimonio"}”</blockquote>
            <figcaption className="mt-2 text-sm text-muted">— {v.author || "Autor"}</figcaption>
          </figure>
        </Frame>
      );
    case "text":
      return (
        <Frame>
          <p className="text-lg text-ink">{renderText(v.value ?? "", props.settings)}</p>
        </Frame>
      );
    case "company": {
      const phone = normalizeBoPhone(v.phone ?? "");
      return (
        <Frame>
          <div className="rounded-2xl bg-brand-800 p-5 text-sm text-brand-50">
            <p className="text-lg font-bold text-white">{v.companyName || "Nombre"}</p>
            {v.tagline && <p className="mt-2">{v.tagline}</p>}
            <p className="mt-3">{phone ? formatBoPhone(phone) : "Teléfono"}</p>
            <p>{v.email || "correo@ejemplo.com"}</p>
            {v.address && <p>{[v.address, v.city, "Bolivia"].filter(Boolean).join(", ")}</p>}
            {v.businessHours && <p>{v.businessHours}</p>}
          </div>
        </Frame>
      );
    }
  }
}
