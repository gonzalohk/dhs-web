import { CategoryCard } from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog, getPageTexts, getSettings, pageText } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: "Productos al por mayor",
    description: `Catálogo de alimentos al por mayor de ${settings.companyName} en Bolivia: productos para restaurantes, tiendas y hoteles. Pida su cotización por WhatsApp.`,
    path: "/products",
  });
}

export default async function ProductsPage() {
  const [catalog, texts, settings] = await Promise.all([
    getCatalog(),
    getPageTexts(),
    getSettings(),
  ]);
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
      <PageHeader title="Productos" intro={pageText(texts, "products.intro", settings)} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((category, i) => (
          <CategoryCard key={category.id} category={category} priority={i < 3} headingLevel="h2" />
        ))}
      </div>
    </>
  );
}
