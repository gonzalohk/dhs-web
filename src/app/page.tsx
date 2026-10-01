import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { CheckIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCatalog, getPageTexts, getSettings, getTestimonials, pageText } from "@/lib/content";
import { buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const [settings, texts] = await Promise.all([getSettings(), getPageTexts()]);
  const title = pageText(texts, "home.title", settings) ?? settings.companyName;
  return {
    ...buildMetadata({
      title,
      description: `${settings.companyName}: distribuidora de alimentos al por mayor para restaurantes y tiendas en Bolivia. Solicite su cotización por WhatsApp.`,
      path: "/",
    }),
    title: { absolute: title },
  };
}

export default async function HomePage() {
  const [settings, texts, catalog, testimonials] = await Promise.all([
    getSettings(),
    getPageTexts(),
    getCatalog(),
    getTestimonials(),
  ]);
  const t = (key: string) => pageText(texts, key, settings);
  const benefits = [1, 2, 3, 4]
    .map((n) => ({ title: t(`home.benefit${n}Title`), text: t(`home.benefit${n}Text`) }))
    .filter((b): b is { title: string; text: string } => Boolean(b.title && b.text));
  const ctaTitle = t("home.ctaTitle");
  const categoriesIntro = t("home.categoriesIntro");

  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />

      <section className="bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
          {t("home.eyebrow") && <p className="font-semibold text-brand-600">{t("home.eyebrow")}</p>}
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-brand-800 sm:text-5xl">
            {t("home.title")}
          </h1>
          {settings.tagline && (
            <p className="mt-4 max-w-2xl text-lg text-muted">{settings.tagline}</p>
          )}
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
          {settings.serviceAreas.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              Atendemos en {settings.serviceAreas.join(", ")}.
            </p>
          )}
        </div>
      </section>

      {catalog.length > 0 && (
        <section aria-labelledby="categories-title" className="mx-auto max-w-6xl px-4 py-14">
          <h2 id="categories-title" className="text-2xl font-bold text-brand-800 sm:text-3xl">
            Nuestros productos
          </h2>
          {categoriesIntro && <p className="mt-2 text-muted">{categoriesIntro}</p>}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {benefits.length > 0 && (
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
      )}

      <TrustSection settings={settings} testimonials={testimonials} />

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-brand-700 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{ctaTitle ?? "Solicite su cotización"}</h2>
          {t("home.ctaText") && (
            <p className="mx-auto mt-2 max-w-xl text-brand-50">{t("home.ctaText")}</p>
          )}
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
