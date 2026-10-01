import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCatalog, getCategory, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getCatalog()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[category]">): Promise<Metadata> {
  const category = await getCategory((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: `${category.name} al por mayor`,
    description: `${category.description} Distribución a restaurantes, tiendas y hoteles en Bolivia.`,
    path: `/products/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/products/[category]">) {
  const [category, settings] = await Promise.all([
    getCategory((await params).category),
    getSettings(),
  ]);
  if (!category) notFound();
  const path = `/products/${category.slug}`;
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Productos", path: "/products" },
          { name: category.name, path },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          category.name,
          category.products.map((p) => ({ name: p.name })),
        )}
      />
      <PageHeader
        title={category.name}
        intro={category.description}
        breadcrumb={[
          { name: "Inicio", href: "/" },
          { name: "Productos", href: "/products" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              fallbackImage={category.imagePublicId}
              whatsappNumber={settings.whatsappNumber}
            />
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
          <h2 className="text-xl font-bold text-brand-800">
            ¿Necesita algo que no está en la lista?
          </h2>
          <p className="mt-1 text-muted">Pregúntenos: conseguimos productos por pedido.</p>
          <WhatsAppButton
            phone={settings.whatsappNumber}
            message={`Hola, quisiera una cotización de productos de ${category.name.toLowerCase()}.`}
            label="Solicitar cotización"
            className="mt-4"
          />
        </div>
      </div>
    </>
  );
}
