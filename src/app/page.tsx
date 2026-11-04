import Image from "next/image";
import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { CheckIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { TrustSection } from "@/components/TrustSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getCatalog, getPageTexts, getSettings, getTestimonials, pageText } from "@/lib/content";
import { COVER_ALT } from "@/content/cover";
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

/** The two main actions of the first screen. */
function HeroActions({
  phone,
  variant = "default",
}: {
  phone: string;
  variant?: "default" | "on-image";
}) {
  return (
    <>
      <WhatsAppButton
        phone={phone}
        message="Hola, quisiera una cotización para mi negocio."
        label="Solicitar cotización por WhatsApp"
      />
      <Link
        href="/products"
        className={`inline-flex min-h-11 items-center justify-center rounded-full border-2 px-5 py-2.5 font-semibold ${
          variant === "on-image"
            ? "border-white text-white hover:bg-white/15"
            : "border-brand-600 text-brand-700 hover:bg-brand-50"
        }`}
      >
        Ver productos
      </Link>
    </>
  );
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

      {/* Foody-style hero, like the template: the vegetable basket fills the right of a full-width
          band, and the text sits over the image's own light, fruit-watermarked left. Swap
          public/foody/carousel-1.jpg to change the photo. */}
      <section
        aria-label={settings.companyName}
        className="relative isolate -mt-[72px] flex min-h-[38rem] items-center overflow-hidden bg-brand-50 pt-[72px]"
      >
        <Image
          src="/foody/carousel-1.jpg"
          alt={COVER_ALT}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[right_center]"
        />

        <div className="text-halo mx-auto w-full max-w-6xl px-4 py-12">
          <Reveal stagger className="max-w-xl">
            {t("home.eyebrow") && (
              <p className="font-semibold tracking-wide text-accent-700 uppercase">
                {t("home.eyebrow")}
              </p>
            )}
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-800 sm:text-5xl lg:text-6xl">
              {t("home.title")}
            </h1>
            {settings.tagline && (
              <p className="mt-4 max-w-md text-lg text-muted">{settings.tagline}</p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <HeroActions phone={settings.whatsappNumber} />
            </div>
            {settings.serviceAreas.length > 0 && (
              <p className="mt-4 text-sm text-muted">
                Atendemos en {settings.serviceAreas.join(", ")}.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {catalog.length > 0 && (
        <section aria-labelledby="categories-title" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <SectionTitle
              id="categories-title"
              eyebrow="Nuestro catálogo"
              title="Nuestros productos"
              intro={categoriesIntro}
            />
          </Reveal>
          <Reveal stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Reveal>
        </section>
      )}

      {benefits.length > 0 && (
        <section aria-labelledby="benefits-title" className="bg-veg bg-brand-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Reveal>
              <SectionTitle
                id="benefits-title"
                align="center"
                eyebrow="Por qué DHS"
                title="¿Por qué elegirnos?"
              />
            </Reveal>
            <Reveal as="ul" stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => (
                <li
                  key={b.title}
                  className="rounded-2xl bg-white p-6 text-center shadow-[0_0_45px_rgba(0,0,0,0.07)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-support-700 text-white">
                    <CheckIcon className="size-7" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-brand-800">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{b.text}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <TrustSection settings={settings} testimonials={testimonials} />

      <section className="on-dark mx-auto max-w-6xl px-4 py-14">
        <Reveal className="rounded-3xl bg-brand-700 px-6 py-10 text-center text-white sm:px-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {ctaTitle ?? "Solicite su cotización"}
          </h2>
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
        </Reveal>
      </section>
    </>
  );
}
