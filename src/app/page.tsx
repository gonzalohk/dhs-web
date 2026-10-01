import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { CheckIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCatalog, getSettings, getTestimonials } from "@/lib/content";
import { buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    ...buildMetadata({
      title: `${settings.companyName}: distribuidora de alimentos en ${settings.city}`,
      description: `${settings.tagline} Frutas, verduras, lácteos, carnes y abarrotes al por mayor para restaurantes y tiendas en Bolivia.`,
      path: "/",
    }),
    title: { absolute: `${settings.companyName}: distribuidora de alimentos en ${settings.city}` },
  };
}

const benefits = [
  { title: "Entregas puntuales", text: "Llegamos en el horario acordado, de lunes a sábado." },
  { title: "Frescura garantizada", text: "Seleccionamos cada día y cuidamos la cadena de frío." },
  { title: "Amplia cobertura", text: "Santa Cruz y las principales ciudades de Bolivia." },
  { title: "Precios por volumen", text: "Cotizaciones a la medida de su negocio." },
];

export default async function HomePage() {
  const [settings, catalog, testimonials] = await Promise.all([
    getSettings(),
    getCatalog(),
    getTestimonials(),
  ]);
  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />

      <section className="bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
          <p className="font-semibold text-brand-600">Distribuidora de alimentos en Bolivia</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-brand-800 sm:text-5xl">
            {settings.companyName}: alimentos frescos y abarrotes para su negocio
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{settings.tagline}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton
              phone={settings.whatsappNumber}
              message="Hola, quisiera una cotización para mi negocio."
              label="Solicitar cotización por WhatsApp"
            />
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-brand-600 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
            >
              Ver productos
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Atendemos en {settings.serviceAreas.join(", ")}.
          </p>
        </div>
      </section>

      <section aria-labelledby="categories-title" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="categories-title" className="text-2xl font-bold text-brand-800 sm:text-3xl">
          Nuestros productos
        </h2>
        <p className="mt-2 text-muted">
          Todo lo que su cocina o tienda necesita, de un solo proveedor.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section aria-labelledby="benefits-title" className="bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="benefits-title" className="text-2xl font-bold text-brand-800 sm:text-3xl">
            ¿Por qué elegirnos?
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <li key={b.title} className="rounded-2xl bg-white p-5 shadow-sm">
                <CheckIcon className="size-7 text-brand-600" />
                <h3 className="mt-3 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted">{b.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TrustSection settings={settings} testimonials={testimonials} />

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-brand-700 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para abastecer su negocio?</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-50">
            Escríbanos y reciba su cotización hoy mismo.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <WhatsAppButton
              phone={settings.whatsappNumber}
              message="Hola, quisiera abrir una cuenta de cliente."
              label="Escríbanos por WhatsApp"
              variant="light"
            />
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white px-5 py-2.5 font-semibold hover:bg-brand-800"
            >
              Otras formas de contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
