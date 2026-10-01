import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSettings, getTestimonials } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: "Nosotros",
    description: `Conozca a ${settings.companyName}: nuestra historia, misión, valores y compromiso con la calidad y la inocuidad alimentaria en Bolivia.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [settings, testimonials] = await Promise.all([getSettings(), getTestimonials()]);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Nosotros", path: "/about" },
        ])}
      />
      <PageHeader title={`Sobre ${settings.companyName}`} intro={settings.tagline} />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
        <section aria-labelledby="story-title">
          <h2 id="story-title" className="text-2xl font-bold text-brand-800">
            Nuestra historia
          </h2>
          <p className="mt-3 text-muted">{settings.story}</p>
          <h2 className="mt-8 text-2xl font-bold text-brand-800">Nuestra misión</h2>
          <p className="mt-3 text-muted">{settings.mission}</p>
        </section>
        <section aria-labelledby="values-title" className="rounded-2xl bg-brand-50 p-6">
          <h2 id="values-title" className="text-2xl font-bold text-brand-800">
            Nuestros valores
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {settings.values.map((v) => (
              <li key={v} className="rounded-xl bg-white p-4 font-medium">
                {v}
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-xl font-bold text-brand-800">Calidad e inocuidad alimentaria</h2>
          <p className="mt-2 text-muted">
            Controlamos la temperatura de los productos refrigerados y congelados desde el almacén
            hasta su negocio, y trabajamos solo con proveedores que cumplen la normativa sanitaria
            boliviana.
          </p>
        </section>
      </div>

      <TrustSection settings={settings} testimonials={testimonials} />

      <div className="mx-auto max-w-6xl px-4 text-center">
        <WhatsAppButton
          phone={settings.whatsappNumber}
          message="Hola, quisiera conocer más sobre sus servicios."
        />
      </div>
    </>
  );
}
