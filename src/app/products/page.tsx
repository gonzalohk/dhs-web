import { CategoryCard } from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Productos al por mayor",
  description:
    "Catálogo de alimentos al por mayor en Bolivia: frutas y verduras, lácteos, carnes, abarrotes, bebidas y congelados para restaurantes y tiendas.",
  path: "/products",
});

export default async function ProductsPage() {
  const catalog = await getCatalog();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Productos", path: "/products" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          "Categorías de productos",
          catalog.map((c) => ({ name: c.name, path: `/products/${c.slug}` })),
        )}
      />
      <PageHeader
        title="Productos"
        intro="Elija una categoría para ver los productos que distribuimos. Pida precios por volumen por WhatsApp."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((category, i) => (
          <CategoryCard
            key={category.id}
            category={category}
            priority={i === 0}
            headingLevel="h2"
          />
        ))}
      </div>
    </>
  );
}
