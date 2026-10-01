import Image from "next/image";
import { formatBob, whatsappLink } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ChatIcon } from "./icons";

type Props = { product: Product; fallbackImage: string | null; whatsappNumber: string };

/** Product with its price in Bs, or a "Solicitar cotización" action when it has no public price. */
export function ProductCard({ product, fallbackImage, whatsappNumber }: Props) {
  const hasPrice = product.priceBob !== null;
  const message = hasPrice
    ? `Hola, quisiera hacer un pedido de ${product.name}.`
    : `Hola, quisiera una cotización de ${product.name}.`;
  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm"
      data-testid="product"
    >
      <Image
        src={product.imageSrc ?? fallbackImage ?? "/images/placeholder.svg"}
        alt={product.imageAlt}
        width={400}
        height={250}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[8/5] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold text-brand-800">{product.name}</h2>
        <p className="mt-1 flex-1 text-sm text-muted">{product.description}</p>
        <p className="mt-4 min-h-7 text-lg font-bold text-ink" data-testid="price">
          {hasPrice ? (
            <>
              {formatBob(product.priceBob!)}{" "}
              <span className="text-sm font-normal text-muted">/ {product.unit}</span>
            </>
          ) : (
            <span className="text-base font-medium text-muted">Precio según volumen</span>
          )}
        </p>
        <a
          href={whatsappLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-whatsapp px-4 font-semibold text-whatsapp hover:bg-brand-50"
        >
          <ChatIcon />
          {hasPrice ? "Pedir por WhatsApp" : "Solicitar cotización"}
        </a>
      </div>
    </article>
  );
}
