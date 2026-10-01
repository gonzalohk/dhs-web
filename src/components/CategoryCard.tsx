import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

type Props = { category: Category; priority?: boolean; headingLevel?: "h2" | "h3" };

export function CategoryCard({ category, priority = false, headingLevel: Heading = "h3" }: Props) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <Image
        src={category.imageSrc ?? "/images/placeholder.svg"}
        alt={category.imageAlt}
        width={400}
        height={250}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        priority={priority}
        className="aspect-[8/5] w-full object-cover"
      />
      <div className="p-5">
        <Heading className="text-lg font-semibold text-brand-800 group-hover:underline">
          {category.name}
        </Heading>
        <p className="mt-1 text-sm text-muted">{category.description}</p>
      </div>
    </Link>
  );
}
