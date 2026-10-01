import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getPageTexts, getSettings, getTestimonials, pageText } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: "Nosotros",
    description: `Conozca a ${settings.companyName}: nuestra empresa, misión, valores y compromiso con la calidad y la inocuidad alimentaria en Bolivia.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [settings, texts, testimonials] = await Promise.all([
    getSettings(),
    getPageTexts(),
    getTestimonials(),
  ]);
  const qualityTitle = pageText(texts, "about.qualityTitle", settings);
  const qualityText = pageText(texts, "about.qualityText", settings);
  const hasStory = Boolean(settings.story || settings.mission);
  const hasValues = settings.values.length > 0 || Boolean(qualityTitle && qualityText);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Nosotros", path: "/about" },
        ])}
      />
      <PageHeader title={`Sobre ${settings.companyName}`} intro={settings.tagline} />

      {(hasStory || hasValues) && (
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2">
          {hasStory && (
            <section aria-labelledby="story-title">
              {settings.story && (
                <>
                  <h2 id="story-title" className="text-2xl font-bold text-brand-800">
                    Nuestra historia
                  </h2>
                  <p className="mt-3 text-muted">{settings.story}</p>
                </>
              )}
              {settings.mission && (
                <>
                  <h2 className="mt-8 text-2xl font-bold text-brand-800 first:mt-0">
                    Nuestra misión
                  </h2>
                  <p className="mt-3 text-muted">{settings.mission}</p>
                </>
              )}
            </section>
          )}
          {hasValues && (
            <section aria-labelledby="values-title" className="rounded-2xl bg-brand-50 p-6">
              {settings.values.length > 0 && (
                <>
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
                </>
              )}
              {qualityTitle && qualityText && (
                <>
                  <h2 className="mt-8 text-xl font-bold text-brand-800 first:mt-0">
                    {qualityTitle}
                  </h2>
                  <p className="mt-2 text-muted">{qualityText}</p>
                </>
              )}
            </section>
          )}
        </div>
      )}

      <TrustSection settings={settings} testimonials={testimonials} />

      <div className="mx-auto max-w-6xl px-4 py-8 text-center">
        <WhatsAppButton
          phone={settings.whatsappNumber}
          message="Hola, quisiera conocer más sobre sus servicios."
        />
      </div>
    </>
  );
}
